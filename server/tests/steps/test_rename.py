import pytest
from pandas import DataFrame

from tests.utils import assert_dataframes_equals
from weaverbird.steps import RenameStep


@pytest.fixture
def sample_df():
    return DataFrame({'NAME': ['foo', 'bar'], 'AGE': [42, 43], 'SCORE': [100, 200]})


def test_rename(sample_df: DataFrame):
    df_result = RenameStep(
        name='rename',
        toRename=[
            ['NAME', 'name'],
            ['AGE', 'age'],
        ],
    ).execute(sample_df)

    expected_result = DataFrame({'name': ['foo', 'bar'], 'age': [42, 43], 'SCORE': [100, 200]})
    assert_dataframes_equals(df_result, expected_result)


def test_rename_legacy_syntax(sample_df: DataFrame):
    df_result = RenameStep(name='rename', oldname='NAME', newname='name',).execute(  # type: ignore
        sample_df
    )

    expected_result = DataFrame({'name': ['foo', 'bar'], 'AGE': [42, 43], 'SCORE': [100, 200]})
    assert_dataframes_equals(df_result, expected_result)
