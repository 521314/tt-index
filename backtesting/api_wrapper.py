"""This module contains a wrapper for the Token Terminal API."""


import requests


class ApiWrapper:
    """Wrapper for the Token Terminal API.

    Args:
        key: str

    Attributes:
        key: str
        headers: str
        base_url: str
    """

    def __init__(self, key):

        self.key = key
        self.headers = {"Authorization": f"Bearer {self.key}"}
        self.base_url = "https://api.tokenterminal.com/"

        # Check that API key is valid
        r = requests.get(self.base_url + "v1/projects", headers=self.headers)
        if r.status_code != 200:
            raise ValueError(f"Authentication failed ({r.status_code})")

    def get_all_projects(self, return_response_object=False):
        """Return an overview of the latest data for all listed projects.

        Args:
            return_response_object: bool, optional

        Returns:
            list or requests.model.Response
        """
        r = requests.get(self.base_url + "v1/projects", headers=self.headers)
        if return_response_object:
            return r
        else:
            return r.json()

    def get_historical_data(
        self,
        project_id,
        interval="daily",
        data_granularity="project",
        return_response_object=False,
    ):
        """Return the historical data of a given project.

        Args:
            project_id: str
            interval: {'daily', 'monthly'}, optional
            data_granularity: {'project', 'top10', 'component'}, optional
            return_response_object: bool, optional

        Returns:
            list or requests.model.Response
        """
        params = {"interval": interval, "data_granularity": data_granularity}
        r = requests.get(
            self.base_url + f"v1/projects/{project_id}/metrics",
            headers=self.headers,
            params=params,
        )

        if return_response_object:
            return r
        else:
            return r.json()
