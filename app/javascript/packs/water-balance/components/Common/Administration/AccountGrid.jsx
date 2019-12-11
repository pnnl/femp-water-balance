import * as React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import {
    Paper,
    Typography,
} from '@material-ui/core';
import {
    IntegratedPaging,
    DataTypeProvider,
    IntegratedSorting,
    IntegratedFiltering,
    PagingState,
    SortingState,
    FilteringState,
} from '@devexpress/dx-react-grid';
import {
    Grid,
    Table,
    TableHeaderRow,
    PagingPanel,
} from '@devexpress/dx-react-grid-material-ui';

const MomentFormatter = ({value, column}) => (
    <Typography>{moment(value).format(column.momentFormat)}</Typography>
);

class AccountGrid extends React.Component {

    render() {
        return (
            <Paper>
                <Grid
                    rows={this.props.accounts}
                    getRowId={(row) => (row.id)}
                    columns={[
                        { name: 'email', title: 'Email Address'},
                        { name: 'last-sign-in-at', title: 'Last Login At', momentFormat: 'MMMM DD YYYY, hh A' },
                        { name: 'created-at', title: 'Created At', momentFormat: 'MMMM DD YYYY, hh A' }
                    ]}
                >
                    <DataTypeProvider formatterComponent={MomentFormatter} for={['created-at','last-sign-in-at']} availableFilterOperations={['dayOfYear', 'contains', 'startsWith', 'endsWith']} />
                    <SortingState
                        defaultSorting={[
                            { columnName: 'email', direction: 'asc' },
                        ]}
                    />
                    <FilteringState />
                    <PagingState defaultCurrentPage={0} pageSize={50} />
                    <IntegratedFiltering />
                    <IntegratedSorting />
                    <IntegratedPaging />
                    <Table />
                    <TableHeaderRow showSortingControls />
                    <PagingPanel pageSizes={[10, 25, 50, 100]} />
                </Grid>
            </Paper>
        );
    }
}

AccountGrid.propTypes = {
    accounts: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default AccountGrid;
