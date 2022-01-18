"""This module contains tests for the functions in the module `backtesting`."""


import os
import datetime
import filecmp

import pandas as pd
import numpy as np
import numpy.testing as npt

import backtesting as bt


TOL = 1e-6
SEED = 123


def test__calculate_weights():
    """Test function `backtest._calculate_weights`."""
    np.random.seed(SEED)
    for _ in range(10):
        for n_projects in [10, 20]:
            for min_weight in [0.0, 0.01, 0.025]:
                for max_weight in [0.2, 0.5, 1.0]:
                    # Randomly sample original weights that are within bounds
                    original = np.zeros(n_projects) + np.inf
                    while np.any(original > max_weight) or np.any(
                        original < min_weight
                    ):
                        original = np.random.random(n_projects)
                        original /= sum(original)
                    target = np.random.random(n_projects)
                    target /= sum(target)
                    for max_change in [0.01, 1.0]:
                        weights = bt._calculate_weights(
                            original=original,
                            target=target,
                            max_change=max_change,
                            min_weight=min_weight,
                            max_weight=max_weight,
                        )
                        npt.assert_almost_equal(sum(weights), 1)
                        npt.assert_equal(
                            np.all(abs(weights - original) <= max_change + TOL), True
                        )
                        npt.assert_equal(min(weights) >= min_weight - TOL, True)
                        npt.assert_equal(max(weights) <= max_weight + TOL, True)
                        # Note that the two conditions above _can_ be tested because
                        # the weights are generated within bounds. If the weights are
                        # not generated within bounds, we can end up in a scenario where
                        # we request incompatible constraints to be met simultaneously.
                        # For example, consider the arrays and constraints below:
                        # original = np.array([0.35, 0.10, 0.10, 0.10, 0.10, 0.05, 0.05, 0.05, 0.05, 0.05])
                        # target   = np.array([0.20, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.05, 0.05])
                        # max_change = 0.05
                        # min_weight = 0.001
                        # max_weight = 0.2
                        # In this example, the fact that one of the projects has a weight
                        # of 0.35 makes it impossible to simultaneously fulfill the
                        # max_weight and max_change constraints. In practice, we relax
                        # the max_weight constraint (i.e. max_change constraint takes
                        # precedence), and we'd arrive a rebalance weight set as follows:
                        # weights = np.array([0.3, 0.089, 0.089, 0.089, 0.089, 0.089, 0.089, 0.089, 0.039, 0.039])
                        npt.assert_equal(
                            sum((weights - target) ** 2)
                            <= sum((original - target) ** 2),
                            True,
                        )
    return


def generate_random_data(n_projects, start_date, n_days):
    """Generate random historical data for tests."""
    np.random.seed(SEED)
    projects = []
    alphabet = np.array(list("abcdefghijklmnopqrstuvwxyz"))
    while len(projects) < n_projects:
        project = "".join(alphabet[np.random.randint(0, 26, 5)])
        if project not in projects:
            projects.append(project)
    columns = [
        "datetime",
        "project",
        "project_id",
        "price",
        "sp",
        "market_cap_circulating",
    ]
    df = pd.DataFrame(columns=columns)
    for i in range(n_days):
        date = start_date + datetime.timedelta(days=i)
        for project in projects:
            row = [
                str(date),
                project,
                project,
                np.random.random() * 100,
                np.random.random(),
                np.random.random() * 1e9,
            ]
            df = df.append(pd.DataFrame(data=[row], columns=columns))
    for m in ["price", "sp", "market_cap_circulating"]:
        df[m] = df[m].astype(float)
    return df.reset_index(drop=True)


def generate_random_portfolio(n_projects, date):
    """Generate random portfolios for tests."""
    projects = []
    alphabet = np.array(list("abcdefghijklmnopqrstuvwxyz"))
    while len(projects) < n_projects:
        project = "".join(alphabet[np.random.randint(0, 26, 5)])
        if project not in projects:
            projects.append(project)
    columns = [
        "datetime",
        "project",
        "project_id",
        "tokens",
        "price",
        "sp",
    ]
    df = pd.DataFrame(columns=columns)
    for project in projects:
        row = [
            str(date),
            project,
            project,
            np.random.random() * 10,
            np.random.random() * 10,
            np.random.random(),
        ]
        df = df.append(pd.DataFrame(data=[row], columns=columns))
    for m in ["tokens", "price", "sp"]:
        df[m] = df[m].astype(float)
    project_values = df["tokens"] * df["price"]
    df.insert(loc=3, column="weight", value=project_values / sum(project_values))
    return df.reset_index(drop=True)


def test__calculate_target_portfolio():
    """Test function `backtest._calculate_target_portfolio`."""
    n_days = 5
    start_date = datetime.date(2021, 1, 1)
    data = generate_random_data(n_projects=50, start_date=start_date, n_days=n_days)
    min_weight = 0.01
    max_weight = 0.2
    for i in range(n_days):
        date = start_date + datetime.timedelta(days=i)
        for n_projects in [10, 20]:
            projects_sorted_by_sp = list(
                data[data["datetime"] == str(date)].sort_values("sp", ascending=False)[
                    "project"
                ]
            )
            for projects_to_include in [
                projects_sorted_by_sp,
                projects_sorted_by_sp[10::],
            ]:
                excluded_projects = np.setdiff1d(
                    np.unique(data["project"]), projects_to_include
                )
                for min_circ_marketcap in [0.0, 1e8]:
                    for value in [1.0, 1e2]:
                        pf = bt._calculate_target_portfolio(
                            n_projects=n_projects,
                            date=date,
                            historical_data=data,
                            projects_to_include=projects_to_include,
                            value=value,
                            min_weight=min_weight,
                            max_weight=max_weight,
                            min_circ_marketcap=min_circ_marketcap,
                        )
                        npt.assert_equal(len(pf), n_projects)
                        npt.assert_equal(
                            np.all(pf["datetime"].values == str(date)), True
                        )
                        for j, p in enumerate(pf["project"]):
                            npt.assert_equal(p in projects_to_include, True)
                            npt.assert_equal(p not in excluded_projects, True)
                            circ_marketcap = bt._get_project_metric(
                                p, "market_cap_circulating", date, data
                            )
                            npt.assert_equal(circ_marketcap >= min_circ_marketcap, True)
                            for m in ["price", "sp"]:
                                npt.assert_almost_equal(
                                    pf.loc[j, m],
                                    bt._get_project_metric(p, m, date, data),
                                )
                        npt.assert_almost_equal(bt._calculate_value(pf), value)
                        npt.assert_equal(
                            np.all(np.argsort(pf["weight"]) == np.argsort(pf["sp"])),
                            True,
                        )
                        npt.assert_equal(min(pf["weight"]) >= min_weight - TOL, True)
                        npt.assert_equal(max(pf["weight"]) <= max_weight + TOL, True)
                        npt.assert_almost_equal(sum(pf["weight"]), 1)
    return


def test__calculate_value():
    """Test function `backtest._calculate_value`."""
    columns = ["price", "tokens"]
    df = pd.DataFrame(columns=columns)
    prices = np.array([1.0, 2.0, 3.0])
    tokens = np.array([4.0, 5.0, 6.0])
    for price, tokens in zip(prices, tokens):
        df = df.append(pd.DataFrame(data=[[price, tokens]], columns=columns))
    npt.assert_equal(bt._calculate_value(df), 1.0 * 4.0 + 2.0 * 5.0 + 3.0 * 6.0)
    return


def test__rebalance():
    """Test function `backtest._rebalance`."""
    n_days = 5
    start_date = datetime.date(2021, 1, 1)
    n_projects = 10
    min_weight = 0.01
    max_weight = 0.2
    min_circ_marketcap = 1e8
    real_data = pd.read_csv(
        os.path.join(os.path.dirname(bt.__file__), "historical_data.csv")
    )
    random_data = generate_random_data(
        n_projects=50, start_date=start_date, n_days=n_days
    )
    for data in [real_data, random_data]:
        for i in range(1, n_days):
            date = start_date + datetime.timedelta(days=i)

            # Get portfolio before rebalancing
            pf = bt._calculate_target_portfolio(
                n_projects=n_projects,
                date=date - datetime.timedelta(days=1),
                projects_to_include=list(np.unique(data["project"])),
                historical_data=data,
                min_circ_marketcap=min_circ_marketcap,
                value=1.0,
                min_weight=min_weight,
                max_weight=max_weight,
            )
            pf["datetime"] = str(date)
            for j, project in enumerate(pf["project"]):
                for metric in ["price", "sp"]:
                    pf.loc[[j], metric] = bt._get_project_metric(
                        project, metric, date, data
                    )
            pf["weight"] = pf["price"] * pf["tokens"]
            pf["weight"] /= sum(pf["weight"])

            for max_change in [0.1, 1.0]:
                rebalanced_pf, _, _ = bt._rebalance(
                    portfolio=pf,
                    date=date,
                    min_weight=min_weight,
                    max_weight=max_weight,
                    max_change=max_change,
                    min_circ_marketcap=min_circ_marketcap,
                    historical_data=data,
                    projects_to_include=list(np.unique(data["project"])),
                )
                npt.assert_equal(
                    np.unique(pf["datetime"]) == np.unique(rebalanced_pf["datetime"]),
                    True,
                )
                npt.assert_almost_equal(sum(rebalanced_pf["weight"]), 1)
                npt.assert_equal(min(rebalanced_pf["weight"]) > min_weight - TOL, True)

                if not (any(pf["weight"].values > (max_weight + max_change))):
                    npt.assert_equal(
                        max(rebalanced_pf["weight"]) < max_weight + TOL, True
                    )
                    # Note that we do not test the above condition when any project
                    # in random data has a pre-rebalance weight > max_weight + max_change.
                    # This is because in these cases, in order for the max_change constraint
                    # to be met, we expect their rebalanced weights will remain > max_weight
                    # For example: project "hcupy" has weight = 0.430919 on 2021-01-04 which
                    # is rebalanced to 0.330919 (corresponding to the maximum change allowed
                    # when max_change = 0.1), which is greater than max_weight = 0.2.

                added = rebalanced_pf[~np.isin(rebalanced_pf["project"], pf["project"])]
                for p in rebalanced_pf["project"]:
                    if p in added["project"].values:
                        w = rebalanced_pf[rebalanced_pf["project"] == p][
                            "weight"
                        ].item()
                        npt.assert_equal(w <= max_change + TOL, True)
                    if p not in added["project"].values:
                        new_w = rebalanced_pf[rebalanced_pf["project"] == p][
                            "weight"
                        ].item()
                        old_w = pf[pf["project"] == p]["weight"].item()
                        npt.assert_equal(
                            abs(new_w - old_w) - max_change < TOL,
                            True,
                        )
                removed = pf[~np.isin(pf["project"], rebalanced_pf["project"])]
                for p in removed["project"]:
                    w = pf[pf["project"] == p]["weight"].item()
                    npt.assert_equal(w <= max_change + TOL, True)
    return


def test_backtest():
    """Test function `backtest.backtest`."""
    n_days = 100
    n_projects = 10
    initial_investment = 1e2
    min_weight = 1e-3
    min_circ_marketcap = 1e8
    start_date = datetime.date(2021, 1, 1)
    end_date = start_date + datetime.timedelta(days=n_days)
    real_data = pd.read_csv("historical_data.csv")
    random_data = generate_random_data(
        n_projects=50, start_date=start_date, n_days=(n_days + 1)
    )
    for data in [real_data, random_data]:
        for max_weight in [0.25, 1.0]:
            for max_change in [0.001, 0.1, 1.0]:
                for rebalancing_frequency in ["monthly", 50]:
                    results = bt.backtest(
                        n_projects=n_projects,
                        initial_investment=initial_investment,
                        min_circ_marketcap=min_circ_marketcap,
                        min_weight=min_weight,
                        max_weight=max_weight,
                        max_change=max_change,
                        start_date=start_date,
                        historical_data=data,
                        projects_to_include=list(np.unique(data["project"])),
                        rebalancing_frequency=rebalancing_frequency,
                        end_date=end_date,
                        quiet=False,
                    )
                    for i, (pf, status) in enumerate(
                        zip(results["portfolios"], results["statuses"])
                    ):
                        dates = pf["datetime"].values
                        npt.assert_equal(np.all(dates == dates[0]), True)
                        date = dates[0]
                        npt.assert_equal(len(pf), n_projects)
                        npt.assert_almost_equal(sum(pf["weight"]), 1)
                        for j, p in enumerate(pf["project"]):
                            for m in ["price", "sp"]:
                                npt.assert_almost_equal(
                                    pf.loc[j, m],
                                    bt._get_project_metric(p, m, date, data),
                                )
                        if status == "start":
                            npt.assert_equal(i, 0)
                        elif status == "normal-day":
                            if rebalancing_frequency == "monthly":
                                npt.assert_equal(date[-2::] == "01", False)
                            else:
                                npt.assert_equal(
                                    (
                                        datetime.datetime.strptime(
                                            date, "%Y-%m-%d"
                                        ).date()
                                        - start_date
                                    ).days
                                    % rebalancing_frequency
                                    == 0,
                                    False,
                                )
                        elif status.startswith("rebalance"):
                            if rebalancing_frequency == "monthly":
                                npt.assert_equal(date[-2::], "01")
                            else:
                                npt.assert_equal(
                                    (
                                        datetime.datetime.strptime(
                                            date, "%Y-%m-%d"
                                        ).date()
                                        - start_date
                                    ).days
                                    % rebalancing_frequency
                                    == 0,
                                    True,
                                )
    return


def test_json_and_csv_generation():
    """Test the following functions:

    - `backtest.results_to_json`
    - `backtest.rebalances_to_json`
    - `backtest.rebalances_to_csv`

    """

    np.random.seed(SEED)

    # Generate a dict with mock portfolios in the same format as the output
    # of the `backtest.backtest` function
    results = dict.fromkeys(["portfolios", "statuses"], [])
    results["statuses"] = [
        "start",
        "normal-day",
        "pre-rebalance",
        "rebalance-init",
        "rebalance-target",
        "rebalanced",
    ]
    dates = [
        datetime.date(2021, 1, 1),
        datetime.date(2021, 1, 2),
        datetime.date(2021, 1, 3),
        datetime.date(2021, 1, 3),
        datetime.date(2021, 1, 3),
        datetime.date(2021, 1, 3),
    ]
    for date in dates:
        results["portfolios"].append(generate_random_portfolio(n_projects=3, date=date))

    # Export the data in `results` in the usual way (as in run_backtest.py)
    results_name = "results"
    results_frontend_name = "results_frontend"
    rebalances_name = "rebalances"
    rebalances_with_target_name = "rebalances_with_target"

    bt.results_to_json(results, json_name=results_name, save_status=True)
    bt.results_to_json(results, json_name=results_frontend_name, save_status=False)
    bt.rebalances_to_json(
        f"{results_name}.json", json_name=rebalances_name, save_target=False
    )
    bt.rebalances_to_json(
        f"{results_name}.json", json_name=rebalances_with_target_name, save_target=True
    )
    bt.rebalances_to_csv(
        f"{rebalances_with_target_name}.json", csv_name=rebalances_with_target_name
    )

    # Make sure that the exported files have the same contents as the gold
    # standard (gs) files in the `test_data` directory
    test = [
        "results.json",
        "results_frontend.json",
        "rebalances.json",
        "rebalances_with_target.json",
        "rebalances_with_target.csv",
    ]
    expected = [
        "gs_results.json",
        "gs_results_frontend.json",
        "gs_rebalances.json",
        "gs_rebalances_with_target.json",
        "gs_rebalances_with_target.csv",
    ]
    test_data_dir = os.path.join(os.path.dirname(__file__), "test_data")
    for t, e in zip(test, expected):
        npt.assert_equal(filecmp.cmp(os.path.join(test_data_dir, e), t), True)

        # Remove files created by this function
        os.remove(t)


def test_e2e():
    """End-to-end (e2e) regression test"""
    # Initialize backtest parameters
    initial_investment = 100.0
    start_date = datetime.date(2021, 1, 1)
    end_date = None
    rebalancing_frequency = 7
    n_projects = 13
    min_weight = 0.001
    max_weight = 0.20
    max_change = 0.05
    min_circ_marketcap = 1e7
    projects_to_include = [
        "0x",
        "1inch",
        "88mph",
        "Aave",
        "Alpha Finance",
        "Arweave",
        "Avalanche",
        "Axie Infinity",
        "Balancer",
        "Bancor",
        "Barnbridge",
        "Binance Smart Chain",
        "Bitcoin",
        "Cap",
        "Cardano",
        "Centrifuge",
        "Compound",
        "Cosmos",
        "Curve",
        "Decred",
        "dForce",
        "dHedge",
        "DODO",
        "Dogecoin",
        "dYdX",
        "Elrond",
        "Enzyme Finance",
        "Erasure Protocol",
        "Ethereum",
        "Ethereum Name Service",
        "Fantom",
        "Filecoin",
        "Harvest Finance",
        "Helium",
        "Idle Finance",
        "Index Cooperative",
        "Instadapp",
        "Keep Network",
        "Kusama",
        "Kyber",
        "Lido Finance",
        "Litecoin",
        "Livepeer",
        "Loopring",
        "MakerDAO",
        "MCDEX",
        "MetaMask",
        "mStable",
        "NEAR Protocol",
        "Nexus Mutual",
        "OpenSea",
        "PancakeSwap",
        "Perpetual Protocol",
        "PieDAO",
        "Polkadot",
        "Polygon",
        "Polymarket",
        "PoolTogether",
        "PowerPool",
        "QuickSwap",
        "Rarible",
        "Rari Capital",
        "Ren",
        "Solana",
        "Stellar",
        "SushiSwap",
        "Synthetix",
        "Terra",
        "Tezos",
        "The Graph",
        "Thorchain",
        "Tokenlon",
        "UMA",
        "Uniswap",
        "Unit Protocol",
        "Venus",
        "Vesper Finance",
        "yearn.finance",
        "Zcash",
    ]

    # Load test historical data into a pandas dataframe
    test_data_dir = os.path.join(os.path.dirname(__file__), "test_data")
    historical_data = pd.read_csv(
        os.path.join(test_data_dir, "historical_data_jan_2021.csv")
    )
    for c in ["datetime", "project"]:
        historical_data[c] = historical_data[c].astype("category")

    # Run backtest
    results = bt.backtest(
        n_projects=n_projects,
        initial_investment=initial_investment,
        min_circ_marketcap=min_circ_marketcap,
        min_weight=min_weight,
        max_weight=max_weight,
        max_change=max_change,
        start_date=start_date,
        historical_data=historical_data,
        projects_to_include=projects_to_include,
        rebalancing_frequency=rebalancing_frequency,
        end_date=end_date,
        quiet=False,
    )

    # Export the data in `results` in the usual way (as in run_backtest.py)
    results_name = "results"
    results_frontend_name = "results_frontend"
    rebalances_name = "rebalances"
    rebalances_with_target_name = "rebalances_with_target"

    bt.results_to_json(results, json_name=results_name, save_status=True)
    bt.results_to_json(results, json_name=results_frontend_name, save_status=False)
    bt.rebalances_to_json(
        f"{results_name}.json", json_name=rebalances_name, save_target=False
    )
    bt.rebalances_to_json(
        f"{results_name}.json", json_name=rebalances_with_target_name, save_target=True
    )
    bt.rebalances_to_csv(
        f"{rebalances_with_target_name}.json", csv_name=rebalances_with_target_name
    )

    # Make sure that the exported files have the same contents as the end-to-end gold
    # standard (gs_e2e) files in the `test_data` directory
    test = [
        "results.json",
        "results_frontend.json",
        "rebalances.json",
        "rebalances_with_target.json",
        "rebalances_with_target.csv",
    ]
    expected = [
        "gs_e2e_results.json",
        "gs_e2e_results_frontend.json",
        "gs_e2e_rebalances.json",
        "gs_e2e_rebalances_with_target.json",
        "gs_e2e_rebalances_with_target.csv",
    ]
    test_data_dir = os.path.join(os.path.dirname(__file__), "test_data")
    for t, e in zip(test, expected):
        npt.assert_equal(filecmp.cmp(os.path.join(test_data_dir, e), t), True)

        # Remove files created by this function
        os.remove(t)
