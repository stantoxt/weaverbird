import pytest
from pandas import DataFrame

from tests.utils import assert_dataframes_equals
from weaverbird.steps.fillna import FillnaStep


@pytest.fixture
def sample_df():
    return DataFrame(
        {'colA': ['toto', 'tutu', None], 'colB': [1, 2, None], 'colC': [100, 50, None]}
    )


def test_simple_fillna(sample_df):
    step = FillnaStep(name='fillna', columns=['colB'], value=-1)
    result = step.execute(sample_df, None, None)
    assert_dataframes_equals(
        result,
        DataFrame({'colA': ['toto', 'tutu', None], 'colB': [1, 2, -1], 'colC': [100, 50, None]}),
    )


def test_simple_fillna_legacy_syntax(sample_df):
    step = FillnaStep(name='fillna', column='colB', value=-1)  # type: ignore
    result = step.execute(sample_df, None, None)
    assert_dataframes_equals(
        result,
        DataFrame({'colA': ['toto', 'tutu', None], 'colB': [1, 2, -1], 'colC': [100, 50, None]}),
    )


def test_fillna_multi_columns(sample_df):
    step = FillnaStep(name='fillna', columns=['colB', 'colC'], value=-1)
    result = step.execute(sample_df, None, None)
    assert_dataframes_equals(
        result,
        DataFrame({'colA': ['toto', 'tutu', None], 'colB': [1, 2, -1], 'colC': [100, 50, -1]}),
    )


def test_fillna_multi_columns_incompatible_types(sample_df):
    step = FillnaStep(name='fillna', columns=['colA', 'colB', 'colC'], value=-1)
    result = step.execute(sample_df, None, None)
    assert_dataframes_equals(
        result, DataFrame({'colA': ['toto', 'tutu', -1], 'colB': [1, 2, -1], 'colC': [100, 50, -1]})
    )
