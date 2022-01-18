"""This module contains functions for backtesting the Token Terminal Index."""


import datetime
import json
import warnings

import numpy as np
import pandas as pd
from scipy.optimize import basinhopping


TOL = 1e-6
SEED = 123


def _calculate_weights(original, target, max_change, min_weight, max_weight):
    """Calculate portfolio component weights by trying to move from `original`
    to `target` within the constraints using non-linear least squares using
    basin-hopping.

    Args:
        original: 1D floating-point numpy.ndarray.
        target: 1D floating-point numpy.ndarray.
        max_change: float.
        min_weight: float.
        max_weight: float.

    Returns:
        1D floating-point numpy.ndarray containing the new weights.
    """

    if not np.isclose(sum(target), 1):
        raise ValueError("Target weights are not normalized")

    def cost(x):
        return sum((x - target) ** 2)

    constraints = (
        {"fun": lambda x: 1 - sum(x), "type": "eq"},
        {"fun": lambda x: max_change - abs(x - original), "type": "ineq"},
    )

    bounds = [(min_weight, max_weight) for _ in original]

    with warnings.catch_warnings():
        # Ignore expected runtime warnings that are raised when
        # the minimizer suggests a move that is outside bounds
        warnings.filterwarnings(
            "ignore",
            "Values in x were outside bounds during a minimize step, clipping to bounds",
            RuntimeWarning,
        )
        results = basinhopping(
            cost,
            original,
            minimizer_kwargs={
                "method": "SLSQP",
                "constraints": constraints,
                "bounds": bounds,
                "tol": TOL,
            },
            seed=SEED,
        ).lowest_optimization_result

    if not results.success:
        raise Exception(f"Weight calculation was not successful ({results.message})")

    if not np.isclose(sum(results.x), 1):
        raise Exception("Normalization constraint was not met")

    if max(abs(results.x - original)) > max_change + TOL:
        raise Exception("max_change constraint was not met")

    if min(results.x) < min_weight - TOL:
        raise Exception("min_weight constraint was not met")

    if max(results.x) > max_weight + TOL:
        raise Exception("max_weight constraint was not met")

    return results.x


def _calculate_target_portfolio(
    n_projects,
    date,
    historical_data,
    projects_to_include,
    value,
    min_weight,
    max_weight,
    min_circ_marketcap,
):
    """Calculate a portfolio based on sales-to-price ratio.

    Args:
        n_projects: int.
        date: datetime.date.
        historical_data: pandas.core.frame.DataFrame containing the data
            extracted by the script `extract_historical_data.py`.
        projects_to_include: list of strings.
        value: float defining the value in USD allocated to the projects of the
            portfolio.
        min_weight: float defining the minimum weight any single project can
            have.
        max_weight: float defining the maximum weight any single project can
            have.
        min_circ_marketcap: float defining the minimum circulating market cap
            in USD a project needs to have to be included.

    Returns:
        pandas.core.frame.DataFrame containing the details of the portfolio.
    """

    # Filter data by date
    df = historical_data[historical_data["datetime"] == str(date)]

    # Only keep data for projects in projects_to_include
    df = df[df["project"].isin(projects_to_include)]

    # Only keep data for projects with circulating market cap and sales-to-price data
    df = df[(df["market_cap_circulating"].notna()) & (df["sp"].notna())]
    if n_projects > len(df):
        raise Exception(f"Not enough projects with market cap and P/S data ({date})")

    # Apply minimum circulating market cap constraint
    df = df[df.market_cap_circulating >= min_circ_marketcap]
    if n_projects > len(df):
        raise Exception(
            f"Not enough projects with sufficient circulating market cap ({date})"
        )

    # Sort projects by sales-to-price ratio and calculate portfolio weights
    df = df.sort_values("sp", ascending=False)[0:n_projects].reset_index(drop=True)
    target = df["sp"].values / sum(df["sp"])
    original = np.copy(target)
    original[original < min_weight] = min_weight
    original[original > max_weight] = max_weight
    df["weight"] = _calculate_weights(
        original=original,
        target=target,
        max_change=1.0,
        min_weight=min_weight,
        max_weight=max_weight,
    )

    # Calculate the numbers of tokens in the portfolio
    df["tokens"] = df["weight"] * value / df["price"]

    return df[["datetime", "project", "project_id", "weight", "tokens", "price", "sp"]]


def _calculate_value(portfolio):
    """Calculate the value of a portfolio in USD.

    Args:
        pandas.core.frame.DataFrame containing the details of the portfolio.

    Returns:
        float.
    """
    value = 0
    for _, row in portfolio.iterrows():
        value += row["price"] * row["tokens"]
    return value


def _get_project_metric(project, metric, date, historical_data):
    """Return the value of a metric of a project on a given date.

    Args:
        project: str.
        metric: str.
        date: datetime.date.
        historical_data: pandas.core.frame.DataFrame containing the data
            extracted by the script `extract_historical_data.py`.

    Returns:
        int, float, or str.
    """
    value = historical_data.loc[
        (historical_data["datetime"] == str(date))
        & (historical_data["project"] == project),
        metric,
    ].item()
    return value


def results_to_json(results, json_name="results", save_status=False):
    """Saves backtest results into a single .json file

    Args:
        results: dictionary generated by the backtest function containing
            details about the portfolios and their statuses
            (keys = "portfolios" and "statuses")
        json_name: string which will be the output file name
        save_status: boolean that defines whether intermediate portfolios, and
            their statuses, are saved in the output json. If False, only the
            "latest" portfolio per day is saved. In the case of rebalance
            days, the "latest" portfolio is the one with status = "rebalanced".
            In all other days, there is only one portfolio, so that is the one
            that is saved.
    """

    values = [_calculate_value(portfolio) for portfolio in results["portfolios"]]

    data = {}

    for portfolio, status, value in zip(
        results["portfolios"], results["statuses"], values
    ):

        date = portfolio.iloc[0, 0]

        if date not in data:
            data[date] = {}

        if save_status is True:
            data[date][status] = {}
            data[date][status]["value"] = float(value)
            data[date][status]["composition"] = []
        else:
            data[date] = {}
            data[date]["value"] = float(value)
            data[date]["composition"] = []

        for project in portfolio["project"]:
            obj = {
                "weight": float(
                    portfolio[portfolio["project"] == project]["weight"].item()
                ),
                "tokens": float(
                    portfolio[portfolio["project"] == project]["tokens"].item()
                ),
                "price": float(
                    portfolio[portfolio["project"] == project]["price"].item()
                ),
                "sp": float(portfolio[portfolio["project"] == project]["sp"].item()),
                "component": project,
                "id": portfolio[portfolio["project"] == project]["project_id"].item(),
            }

            if save_status is True:
                data[date][status]["composition"].append(obj)
            else:
                data[date]["composition"].append(obj)

    with open(f"{json_name}.json", "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=4)


def rebalances_to_json(path, json_name="rebalances", save_target=False):
    """Creates rebalancing summary .json file from backtest results .json file

    Args:
        path: path to a backtest results .json file generated by the
            results_to_json function
        json_name: string which will be the output file name
        save_target: boolean that defines whether init and target portfolios
            are saved in the output json
    """

    # Load data from input .json file
    with open(path) as json_file:
        data = json.load(json_file)

    data_new = {}

    # Loop through all days, see when rebalances happened, save weight changes
    for day in data:

        keys = list(data[day].keys())

        if all(
            x in keys
            for x in [
                "pre-rebalance",
                "rebalance-init",
                "rebalance-target",
                "rebalanced",
            ]
        ):  # rebalance occured

            data_new[day] = {}
            data_new[day]["composition"] = []

            # From this point onwards:
            # - pf means portfolio
            # - pre refers to pre-rebalancing data
            # - post refers to post-rebalancing data

            pf_pre = data[day]["pre-rebalance"]
            pf_post = data[day]["rebalanced"]

            composition_pre = pf_pre["composition"]
            composition_post = pf_post["composition"]

            if save_target:
                pf_init = data[day]["rebalance-init"]
                composition_init = pf_init["composition"]
                pf_target = data[day]["rebalance-target"]
                composition_target = pf_target["composition"]

            tokens_pre = [comp["component"] for comp in composition_pre]
            tokens_post = [comp["component"] for comp in composition_post]

            # Initialize list with all tokens in both the pre and post pfs
            tokens = sorted(list(set(tokens_pre + tokens_post)))

            # Init lists for summary measures
            values = []
            weights_post = []
            rebalances = []

            # Loop through each token and calculate its weight change
            for token in tokens:

                # Get the token id (EAFP idiom)
                try:
                    id = next(
                        item["id"]
                        for item in composition_pre
                        if item["component"] == token
                    )
                except StopIteration:
                    id = next(
                        item["id"]
                        for item in composition_post
                        if item["component"] == token
                    )

                # Get the indices of the current token in the pre and post pfs
                token_post_idx = next(
                    (
                        idx
                        for (idx, d) in enumerate(composition_post)
                        if d["component"] == token
                    ),
                    None,
                )
                token_pre_idx = next(
                    (
                        idx
                        for (idx, d) in enumerate(composition_pre)
                        if d["component"] == token
                    ),
                    None,
                )

                # Get the weights of the current token in the pre and post pfs
                weight_pre = (
                    0
                    if token_pre_idx is None
                    else composition_pre[token_pre_idx]["weight"]
                )

                weight_post = (
                    0
                    if token_post_idx is None
                    else composition_post[token_post_idx]["weight"]
                )

                if save_target:
                    token_init_idx = next(
                        (
                            idx
                            for (idx, d) in enumerate(composition_init)
                            if d["component"] == token
                        ),
                        None,
                    )
                    weight_init = (
                        0
                        if token_init_idx is None
                        else composition_init[token_init_idx]["weight"]
                    )
                    token_target_idx = next(
                        (
                            idx
                            for (idx, d) in enumerate(composition_target)
                            if d["component"] == token
                        ),
                        None,
                    )
                    weight_target = (
                        0
                        if token_target_idx is None
                        else composition_target[token_target_idx]["weight"]
                    )

                # Calculate metrics and save to dictionary
                weight_change = weight_post - weight_pre
                allocation_usd = pf_post["value"] * weight_post

                if save_target:
                    obj = {
                        "component": token,
                        "id": id,
                        "weight_pre": weight_pre,
                        "weight_init": weight_init,
                        "weight_target": weight_target,
                        "weight_post": weight_post,
                        "rebalance": weight_change,
                        "value": allocation_usd,
                    }
                else:
                    obj = {
                        "component": token,
                        "id": id,
                        "weight_pre": weight_pre,
                        "weight_post": weight_post,
                        "rebalance": weight_change,
                        "value": allocation_usd,
                    }

                data_new[day]["composition"].append(obj)

                values.append(allocation_usd)
                weights_post.append(weight_post)
                rebalances.append(weight_change)

            # We include rebalancing info for all tokens, including adds
            # and removals, so we calculate the average of the absolute value
            # of the rebalances to keep track of the "magnitude" of the
            # rebalancing
            rebalances_abs = [abs(x) for x in rebalances]

            data_new[day]["value_total"] = sum(values)
            data_new[day]["weight_post_total"] = sum(weights_post)
            data_new[day]["rebalance_abs_avg"] = sum(rebalances_abs) / len(
                rebalances_abs
            )

    with open(f"{json_name}.json", "w", encoding="utf-8") as file:
        json.dump(data_new, file, ensure_ascii=False, indent=4)


def rebalances_to_csv(path, csv_name="rebalances"):
    """Converts rebalances.json into a csv file

    Args:
        path: path to a rebalances results .json file generated by the
            rebalances_to_json function
        csv_name: string which will be the output file name
    """

    # Load data from input .json file
    with open(path) as json_file:
        data = json.load(json_file)

    with open(f"{csv_name}.csv", "w") as file:

        # csv header
        file.write(
            "day,component,weight_pre,weight_init,weight_target,weight_post,rebalance\n"
        )

        # Loop through days/components and save details to the csv
        for day in data:

            for component in data[day]["composition"]:

                file.write(
                    f"{day},"
                    f"{component['component']},"
                    f"{component['weight_pre']},"
                    f"{component['weight_init']},"
                    f"{component['weight_target']},"
                    f"{component['weight_post']},"
                    f"{component['rebalance']}\n"
                )


def _rebalance(
    portfolio,
    date,
    min_weight,
    max_weight,
    max_change,
    min_circ_marketcap,
    historical_data,
    projects_to_include,
):
    """Calculate a portfolio based on a given portfolio and sales-to-price
    ratios. The new weights are constrained to be within `max_change` from what
    they are in `portfolio`.

    Args:
        portfolio: pandas.core.frame.DataFrame containing the details of the
            portfolio.
        date: datetime.date.
        min_weight: float defining the minimum weight any single project can
            have.
        max_weight: float defining the maximum target weight any single project
            can have.
        max_change: float defining the maximum amount the weight of a project
            is allowed to change during rebalancing.
        min_circ_marketcap: float defining the minimum circulating market cap
            in USD a project needs to have to be included.
        historical_data: pandas.core.frame.DataFrame containing the data
            extracted by the script `extract_historical_data.py`.
        projects_to_include: list of strings.

    Returns:
        tuple of pandas.core.frame.DataFrame instances containing the details
        of the rebalanced, target, and constrained target portfolios.

    Note:
        The target portfolio is calculated in three steps. First, an initial
        target portfolio is calculated from the project sales-to-price ratios.
        Second, projects in the original portfolio that are not in the initial
        target and have a weight less than or equal to max_change are replaced
        by new projects in the initial target with the highest sales-to-price
        ratios. Third, the final target portfolio is calculated from the
        sales-to-price ratios of these projects.
    """

    pf = portfolio.copy()
    n_projects = len(pf)
    value = _calculate_value(pf)

    # Calculate initial target portfolio
    init_target_pf = _calculate_target_portfolio(
        n_projects=n_projects,
        date=date,
        historical_data=historical_data,
        projects_to_include=projects_to_include,
        value=value,
        min_weight=min_weight,
        max_weight=max_weight,
        min_circ_marketcap=min_circ_marketcap,
    )

    # Replace projects with low enough weight that are not in the initial target
    new_projects = (
        init_target_pf[~np.isin(init_target_pf["project"], pf["project"])]
        .sort_values(by="weight", ascending=False)
        .reset_index(drop=True)
    )
    replaced = 0
    for i, p in enumerate(pf["project"]):
        if p not in init_target_pf["project"].values:
            target_w = 0
        else:
            target_w = init_target_pf.loc[
                init_target_pf["project"] == p, "weight"
            ].item()
        if target_w < TOL and pf.loc[i, "weight"] <= max_change:
            pf.iloc[[i]] = new_projects.iloc[[replaced]]
            for m in ["weight", "tokens"]:
                pf.loc[i, m] = 0
            replaced += 1

    # Calculate final target portfolio weights
    target_pf = pf.copy()
    target_pf["weight"] = _calculate_weights(
        original=np.ones(n_projects) / n_projects,
        target=target_pf["sp"].values / sum(target_pf["sp"]),
        max_change=1.0,
        min_weight=min_weight,
        max_weight=max_weight,
    )

    # Calculate portfolio weights after rebalancing
    pf["weight"] = _calculate_weights(
        original=pf["weight"].values,
        target=target_pf["weight"].values,
        max_change=max_change,
        min_weight=min_weight,
        max_weight=1.0,
    )

    # Update numbers of tokens
    pf["tokens"] = pf["weight"] * value / pf["price"]
    target_pf["tokens"] = target_pf["weight"] * value / target_pf["price"]

    return pf, init_target_pf, target_pf


def backtest(
    n_projects,
    initial_investment,
    min_circ_marketcap,
    min_weight,
    max_weight,
    max_change,
    start_date,
    historical_data,
    projects_to_include,
    rebalancing_frequency,
    end_date=None,
    quiet=True,
):
    """Backtest the Token Terminal Index by simulating historical performance.

    Args:
        n_projects: int.
        initial_investment: float defining the initial investment in USD.
        min_circ_marketcap: float defining the minimum circulating market cap
            in USD a project needs to have to be included.
        min_weight: float defining the minimum weight any single project
            can have.
        max_weight: float defining the target maximum weight any single project
            can have.
        max_change: float defining the maximum amount the weight of a project
            is allowed to change during rebalancing.
        start_date : datetime.date.
        historical_data: pandas.core.frame.DataFrame containing the data
            extracted by the script `extract_historical_data.py`.
        projects_to_include: list of strings.
        rebalancing_frequency: "monthly" or a positive integer representing the
            number of days between rebalances.
        end_date : datetime.date. If not given, the end date is the last date
            for which there is data in `historical_data`.
        quiet : bool defining whether not to print messages about the progress
            of computation.

    Returns:
        dict of pandas.core.frame.DataFrame instances containing the details of
        the portfolios over time.
    """

    # Validate input
    if type(n_projects) is not int or n_projects <= 0:
        raise ValueError("n_projects must be a positive integer")
    if type(initial_investment) is not float or initial_investment <= 0:
        raise ValueError("initial_investment must be a positive float")
    if type(min_circ_marketcap) is not float or min_circ_marketcap <= 0:
        raise ValueError("min_circ_marketcap must be a positive float")
    if (
        type(min_weight) is not float
        or min_weight <= 0
        or min_weight > min_weight > 1 / n_projects
    ):
        raise ValueError(
            "min_weight must be a float greater than 0 and less than or equal to 1/n_projects"
        )
    if type(max_weight) is not float or max_weight <= 0 or max_weight > 1:
        raise ValueError("max_weight must be greater than 0 and less or equal to 1")
    if max_weight < 1 / n_projects:
        raise ValueError("max_weight must greater than or equal to 1/n_projects")
    if max_weight <= min_weight:
        raise ValueError("max_weight must be greater than min_weight")
    if type(max_change) is not float or max_change <= 0 or max_change > 1:
        raise ValueError("max_change must be greater than 0 and less or equal to 1")
    if type(start_date) is not datetime.date:
        raise ValueError("start_date must be a datetime.date instance")
    if type(historical_data) is not pd.core.frame.DataFrame:
        raise ValueError(
            "historical_data must be a pandas.core.frame.DataFrame instance"
        )
    if type(projects_to_include) is not list or not all(
        [type(i) is str for i in projects_to_include]
    ):
        raise ValueError("projects_to_include must be a list of strings")
    if len(np.unique(projects_to_include)) < n_projects:
        raise ValueError(
            "projects_to_include must contain at least n_projects unique projects"
        )
    for project in projects_to_include:
        if project not in historical_data["project"].values:
            raise ValueError(f"There is no data for {project} in historical_data")
    if end_date is not None:
        if type(end_date) is not datetime.date:
            raise ValueError("end_date must be a datetime.date instance")
    if type(quiet) is not bool:
        raise ValueError("quiet must be a boolean")
    if not (
        rebalancing_frequency == "monthly"
        or type(rebalancing_frequency) is int
        and rebalancing_frequency > 0
    ):
        raise ValueError(
            "rebalancing_frequency must be 'monthly' or a positive integer"
        )

    if end_date is None:  # Run until most recent date in historical data
        end_date = datetime.datetime.strptime(
            historical_data["datetime"].astype("object").max(), "%Y-%m-%d"
        ).date()

    # Loop over days and save portfolios in a list
    results = {}
    results["portfolios"] = []
    results["statuses"] = []

    n_days = (end_date - start_date).days + 1
    for i in range(n_days):

        date = start_date + datetime.timedelta(days=i)
        if not quiet:
            print(date, end="\r")

        if i == 0:  # Calculate initial portfolio
            portfolio = _calculate_target_portfolio(
                n_projects=n_projects,
                date=date,
                historical_data=historical_data,
                projects_to_include=projects_to_include,
                min_circ_marketcap=min_circ_marketcap,
                value=initial_investment,
                min_weight=min_weight,
                max_weight=max_weight,
            )
            results["portfolios"].append(portfolio)
            results["statuses"].append("start")

        else:  # Update date, price, sp, and weight
            portfolio = results["portfolios"][-1].copy()
            portfolio["datetime"] = str(date)

            # Filter the dataframe for increased performance
            df = historical_data.loc[
                (historical_data["datetime"] == str(date))
                & (historical_data["project"].isin(portfolio["project"])),
                ["project", "price", "sp"],
            ]
            for j, project in enumerate(portfolio["project"]):
                for metric in ["price", "sp"]:
                    portfolio.loc[j, metric] = df.loc[
                        df["project"] == project, metric
                    ].item()

            portfolio["weight"] = (
                portfolio["price"] * portfolio["tokens"] / _calculate_value(portfolio)
            )

            rebalance = False
            if rebalancing_frequency == "monthly":
                if date.day == 1:
                    rebalance = True
            elif i % rebalancing_frequency == 0:
                rebalance = True
            if rebalance:

                # Save pre-rebalance portfolio with weights updated for day 1
                results["portfolios"].append(portfolio)
                results["statuses"].append("pre-rebalance")

                # Rebalance
                portfolio, init, target = _rebalance(
                    portfolio=portfolio,
                    date=date,
                    min_weight=min_weight,
                    max_weight=max_weight,
                    max_change=max_change,
                    min_circ_marketcap=min_circ_marketcap,
                    historical_data=historical_data,
                    projects_to_include=projects_to_include,
                )

                # Save rebalance-init portfolio
                results["portfolios"].append(init)
                results["statuses"].append("rebalance-init")

                # Save target portfolio
                results["portfolios"].append(target)
                results["statuses"].append("rebalance-target")

                # Save rebalanced portfolio
                results["portfolios"].append(portfolio)
                results["statuses"].append("rebalanced")

            else:  # No rebalance needed, just save the portfolio
                results["portfolios"].append(portfolio)
                results["statuses"].append("normal-day")

    return results
