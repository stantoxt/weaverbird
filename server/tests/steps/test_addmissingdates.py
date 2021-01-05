import datetime
from datetime import timedelta
from typing import Any, List, Optional, cast

import pandas as pd
import pytest

from tests.utils import assert_dataframes_equals
from weaverbird.steps.addmissingdates import AddMissingDatesStep


@pytest.fixture()
def today():
    now = datetime.datetime.today()
    return datetime.datetime(year=now.year, month=now.month, day=now.day)


def test_missing_date(today):
    dates = [today + timedelta(days=nb_day) for nb_day in list(range(1, 10)) + list(range(12, 20))]
    missing_dates = [today + timedelta(days=10), today + timedelta(days=11)]

    values = [idx for (idx, value) in enumerate(dates)]
    df = pd.DataFrame(
        {
            'date': dates,
            'value': values,
        }
    )

    step = AddMissingDatesStep(
        name='addmissingdates', datesColumn='date', datesGranularity='day', groups=[]
    )

    result = step.execute(df)
    expected_result = pd.concat(
        [df, pd.DataFrame({'date': missing_dates, 'value': [None, None]})]
    ).sort_values(by='date')

    assert_dataframes_equals(result, expected_result)


def test_missing_date_years(today):
    dates = [
        today + timedelta(days=nb_years * 365)
        for nb_years in list(range(1, 10)) + list(range(12, 20))
    ]
    missing_dates = [today + timedelta(days=10 * 365), today + timedelta(days=11 * 365)]

    # dates added by pandas are at the beginning of the last day of the year
    missing_dates = [
        datetime.datetime(year=missing_date.year, month=12, day=31)
        for missing_date in missing_dates
    ]
    values = [idx for (idx, value) in enumerate(dates)]

    df = pd.DataFrame(
        {
            'date': dates,
            'value': values,
        }
    )

    step = AddMissingDatesStep(
        name='addmissingdates', datesColumn='date', datesGranularity='year', groups=[]
    )

    result = step.execute(df)
    expected_result = pd.concat(
        [df, pd.DataFrame({'date': missing_dates, 'value': [None, None]})]
    ).sort_values(by='date')

    assert_dataframes_equals(result, expected_result)


def test_missing_date_with_groups(today):
    dates = [today + timedelta(days=nb_day) for nb_day in list(range(1, 10)) + list(range(12, 20))]
    missing_dates = [today + timedelta(days=10), today + timedelta(days=11)]

    values = [idx for (idx, value) in enumerate(dates)]
    df = pd.DataFrame(
        {
            'date': dates * 2,
            'country': ['France'] * len(dates) + ['USA'] * len(dates),
            'value': values * 2,
        }
    )

    step = AddMissingDatesStep(
        name='addmissingdates', datesColumn='date', datesGranularity='day', groups=['country']
    )
    result = step.execute(df)
    expected_result = pd.concat(
        [
            df,
            pd.DataFrame(
                {
                    'country': cast(List[Optional[Any]], ['France'] * 2 + ['USA'] * 2),
                    'date': missing_dates * 2,
                    'value': [None, None] * 2,
                }
            ),
        ]
    ).sort_values(by=['country', 'date'])
    assert_dataframes_equals(result, expected_result)
