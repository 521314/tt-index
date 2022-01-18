import datetime
import pandas as pd

import backtesting as bt

# Once data is loaded. running this file `python run_backtest.py` will re-run
# the backtest and update all JSON files (required for frontend but to avoid
# confusion all result files in the repo should have this data)

print("Running backtest")

# Initialize backtest parameters
initial_investment = 115.24  # USD price of DPI on Jan 1st 2021
start_date = datetime.date(2021, 1, 1)
end_date = None
rebalancing_frequency = "monthly"
n_projects = 13
min_weight = 0.001
max_weight = 0.20
max_change = 0.05
min_circ_marketcap = 1e8
projects_to_include = [
    "0x",
    "1inch",
    "88mph",
    "Aave",
    "Abracadabra.money",
    "Alchemix Finance",
    "Alpha Finance",
    "Axie Infinity",
    "Balancer",
    "Bancor",
    "Barnbridge",
    "Basket DAO",
    "Centrifuge",
    "Clipper",
    "Compound",
    # "Cream",
    "Cryptex",
    "Curve",
    "dForce",
    "dHedge",
    "DODO",
    "dYdX",
    "Enzyme Finance",
    "Erasure Protocol",
    "Ethereum Name Service",
    "Fei Protocol",
    "Harvest Finance",
    # "Hegic",
    "Idle Finance",
    "Index Cooperative",
    # "Indexed Finance",
    "Instadapp",
    "Integral Protocol",
    # "KeeperDAO",
    "Keep Network",
    "Kyber",
    "Lido Finance",
    "Liquity",
    "Livepeer",
    "Loopring",
    "MakerDAO",
    # "Mirror Protocol",
    "mStable",
    "Nexus Mutual",
    "Notional Finance",
    "Perpetual Protocol",
    "PieDAO",
    "PoolTogether",
    "PowerPool",
    "Rarible",
    "Rari Capital",
    "Reflexer",
    "Ren",
    "Ribbon Finance",
    # "SIREN Markets",
    "Stake DAO",
    "SushiSwap",
    # "Swerve Finance",
    "Synthetix",
    "The Graph",
    "Thorchain",
    "Tokenlon",
    "UMA",
    "Uniswap",
    "Unit Protocol",
    "Vesper Finance",
    # "Visor Finance",
    "yearn.finance",
    "Yield Guild Games",
]

# Load historical data into a pandas dataframe
historical_data = pd.read_csv("historical_data.csv")
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

print("Saving results")

# Initialize file names for saving results
results_name = "results"
results_frontend_name = "results_frontend"
rebalances_name = "rebalances"
rebalances_with_target_name = "rebalances_with_target"

# Save granular info about portfolio composition
bt.results_to_json(results, json_name=results_name, save_status=True)

# Save summarised portfolio composition for index.tokenterminal.com charts
bt.results_to_json(results, json_name=results_frontend_name, save_status=False)

# Save rebalances info for index.tokenterminal.com tables
bt.rebalances_to_json(
    f"{results_name}.json", json_name=rebalances_name, save_target=False
)

# Save more detailed rebalances info for debugging purposes
bt.rebalances_to_json(
    f"{results_name}.json", json_name=rebalances_with_target_name, save_target=True
)
bt.rebalances_to_csv(
    f"{rebalances_with_target_name}.json", csv_name=rebalances_with_target_name
)
