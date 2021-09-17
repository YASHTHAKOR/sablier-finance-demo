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
import LinearProgressBar from '../commons/ProgressBar';

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});



function Streams({
                     data,
                     receiver
                 }) {

    const history = useHistory()

    const classes = useStyles();

    const getStreamDetails = (streamId) => {
        history.push(`/stream/${streamId}`);
    }

    const getCompletionPercentage = (stream) => {
        let currentTime = new Date().getTime()/1000;

        if(currentTime > stream.startTime && currentTime < stream.stopTime) {
            return Math.round(((currentTime - stream.startTime)* 100)/ (stream.stopTime - stream.startTime));
        } else if(currentTime > stream.stopTime) {
            return 100;
        } else if(currentTime < stream.startTime) {
            return 0;
        }

        return 0;

    }

    return <Fragment>
        {data.length ?<TableContainer component={Paper}>
            <Table className={classes.table} aria-label="caption table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Stream Id</TableCell>
                        <TableCell align="center">{receiver?'Senders Address': 'Receivers Address'}</TableCell>
                        <TableCell align="center">Token Name</TableCell>
                        <TableCell align="center">Streaming completion status</TableCell>
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
                            <TableCell align="center">{receiver?stream.sender:stream.recipient}</TableCell>
                            <TableCell align="center">{stream.token.name}</TableCell>
                            <TableCell align="center"><LinearProgressBar value={getCompletionPercentage(stream)}/></TableCell>
                            <TableCell align="center">{stream.token.decimals}</TableCell>
                            <TableCell align="center">{(stream.deposit/(10 ** stream.token.decimals)).toFixed(4)}</TableCell>
                            <TableCell align="center">{stream.withdrawals.length}</TableCell>
                            <TableCell align="center">{stream.cancellation? 'Yes': 'No'}</TableCell>
                            <TableCell align="center">
                                <Button variant="contained" color="primary" onClick={() => getStreamDetails(stream.id)}>Details</Button>
                                <Button variant="outlined" color="secondary"  href={`https://pay.sablier.finance/stream/${stream.id}`} target={"__blank"}>sablier</Button>

                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>: <div>Not Records Found</div>}
    </Fragment>

}

export default Streams;