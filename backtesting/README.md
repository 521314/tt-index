# Backtesting

This directory contains the backtesting code used to simulate the theoretical historical performance and composition of TTI as showcased on the official TTI proposal [website](https://index.tokenterminal.com/). To perform backtesting, you must first download the historical data (pro-tip: you can use our Token Terminal Pro free 3-day trial to download these data).

## Dependencies

You may wish to create a virtual environment to ensure you have all the required dependencies. For example, using [virtualenv](https://virtualenv.pypa.io/en/latest/) and [pip](https://pip.pypa.io/en/stable/), and assuming your current working directory is the `tt-index-monorepo` root directory, you can do:

```bash
cd backtesting/
virtualenv -p python3 venv
source venv/bin/activate
pip install -r requirements.txt
```

You should now have a fresh virtual environment with all the required dependencies.

## Extract historical data

Add your TT API key to a local `.env` file saved in the `backtesting` root directory. The contents should look like:

```
TT_API_KEY=your-api-key-here
```

Then, execute the script `extract_historical_data.py` which will extract the data of all listed projects and save it in `historical_data.csv`. Note that the `.env` file will not be pushed to github as it is explicitly ignored on `.gitignore`.

## Backtest

Code for backtesting is in the `backtesting.py` module. The `example.ipynb` notebook demonstrates its usage with an identical set of parameters as those used to generate the backtest showcased on the TTI proposal [website](https://index.tokenterminal.com/).

Assuming your working directory is the `backtesting` directory and the `venv` virtual environment is active (see [Dependencies](#dependencies) section), you can launch `example.ipynb` by running [`jupyter notebook`](https://docs.jupyter.org/en/latest/running.html#starting-the-notebook-server):

```bash
jupyter-notebook example.ipynb
```

Then, click **Run All** in the [Cell](https://jupyter-notebook.readthedocs.io/en/stable/examples/Notebook/Running%20Code.html?highlight=run%20all#Cell-menu) menu to execute the code.

### Parameters

The table below summarises the main parameters that can be used to configure the backtest simulations. For more details, check the code documentation (arguments of the `backtest` function):

| Argument                | Description                                                      |
|-------------------------|------------------------------------------------------------------|
| `n_projects`            | Number of index components.                                      |
| `initial_investment`    | Starting value for the index.                                    |
| `min_circ_marketcap`    | Minimum circulating market cap ($) for a project to be eligible. |
| `min_weight`            | Minimum weight a component must have to be eligible.             |
| `max_weight`            | Maximum target* weight.                                          |
| `max_change`            | Maximum allowed weight change on rebalances.                     |
| `start_date`            | Date when backtest starts.                                       |
| `end_date`              | Date when backtest ends (if None, use all data available).       |
| `rebalancing_frequency` | Specifies the time interval between rebalances.                  |

*Note that if the weight of an asset exceeds `max_weight` + `max_change` before rebalancing (due to price appreciation during the preceding period), its weight will remain greater than `max_weight` after rebalancing due to the `max_change` constraint taking precedence. For example, if an assets' weight (before rebalancing) is 30% and `max_change` is 5%, its weight (after rebalancing) will not be lower than 25%.

### Algorithm

The backtesting algorithm consists of 3 main steps:

1. Calculate initial portfolio.
2. Update portfolio weights on non-rebalancing days.
3. Rebalance portfolio on rebalancing days.

#### Calculation of initial portfolio

1. Initialize list of candidate assets. An asset is eligible if:
    1. Is included in `projects_to_include` (argument of `backtest` function).
    2. Has P/S data available.
    3. Has a circulating market cap >= `min_circ_marketcap`
2. Find `n_projects` projects with the highest S/P (inverted P/S), sort them in descending order.
3. Divide each projects’ S/P value by the sum of all S/P values of the `n_projects` projects to get the target weightings for each asset.
4. Calculate actual initial portfolio weights by solving an optimization problem that finds a set of weights which minimizes the sum of squared differences between itself and the target set of weights while fulfilling the following constraints:
    1. Weights sum to 1.
    2. Maximum weight assigned to a single asset <= `max_weight`.
    3. Minimum weight assigned to a single asset >= `min_weight`.
5. Calculate portfolio allocation based on the resulting weight set and the initial investment amount.

#### Update portfolio on non-rebalancing days

On non-rebalancing days, we simply take the prices of the portfolio components on those days and adjust their weights, values ($), and total portfolio value ($).

#### Rebalance portfolio on rebalancing days

1. Update total portfolio value according to the constituent asset prices for this day. This is the same process as in non-rebalancing days (see previous section) to determine the total $ value available for rebalancing. This is the `pre-rebalance` portfolio.
2. Calculate a `rebalance-init` portfolio following the steps detailed on "Calculation of initial portfolio". This is the portfolio that we would get if we did not have to abide by the max change constraint, as in the case of the first day of the simulation. If this was the case, we could replace assets while only needing to fulfil the min/max weight constraints.
3. Replace projects that are in the `pre-rebalance` portfolio with a weight <= max_change but are not on `rebalance-init`, by the projects with the lowest P/S that are in `rebalance-init` and not in `pre-rebalance`. This gives us the final list of components which will be part of the index after the rebalancing.
4. Having the final portfolio components, calculate their desired % allocation based on P/S: `rebalance-target` portfolio.
5. Take the desired allocation (_target_ set of weights) and solve the optimization problem described in "Calculation of initial portfolio" to find the closest set of weights to `rebalance-target` while this time ensuring that the weight of any component does not change by more than max_change compared to the `pre-rebalance` portfolio.

## Automated tests

Tests can be run with pytest by executing the following command while in the `backtesting` root directory:

```
pytest 
```
