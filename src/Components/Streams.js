import {Fragment, useState, useEffect} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TableHead,
    Paper,
    Button
} from '@material-ui/core';
import { useHistory } from "react-router"
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});


function Streams({
                     data
                 }) {

    const history = useHistory()

    const classes = useStyles();

    const getStreamDetails = (streamId) => {
        history.push(`/stream/${streamId}`);
    }

    return <Fragment>
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="caption table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Stream Id</TableCell>
                        <TableCell align="center">Receivers Address</TableCell>
                        <TableCell align="center">Token Name</TableCell>
                        <TableCell align="center">Decimals</TableCell>
                        <TableCell align="center">Amount</TableCell>
                        <TableCell align="center">Withdrawals</TableCell>
                        <TableCell align="center">Cancelled</TableCell>
                        <TableCell align="center">Stream</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((stream) => (
                        <TableRow key={stream.id}>
                            <TableCell align="center">{stream.id}</TableCell>
                            <TableCell align="center">{stream.recipient}</TableCell>
                            <TableCell align="center">{stream.token.name}</TableCell>
                            <TableCell align="center">{stream.token.decimals}</TableCell>
                            <TableCell align="center">{(stream.deposit/(10 ** stream.token.decimals)).toFixed(4)}</TableCell>
                            <TableCell align="center">{stream.withdrawals.length}</TableCell>
                            <TableCell align="center">{stream.cancellation? 'Yes': 'No'}</TableCell>
                            <TableCell align="center"><Button variant="contained" color="primary" onClick={() => getStreamDetails(stream.id)}>Details</Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Fragment>

}

export default Streams;