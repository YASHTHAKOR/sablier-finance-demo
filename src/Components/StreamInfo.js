import {Fragment, useState} from "react";
import {Link, useParams} from 'react-router-dom';
import {
    gql,
    useQuery
} from '@apollo/client';
import {
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TableHead,
    Paper,
    Button,
    CircularProgress, ButtonGroup
} from "@material-ui/core";
import moment from 'moment';
import {
    useDispatch, useSelector
} from 'react-redux';
import {
    withdrawSablierFromStream,
    cancelSablierStream
} from '../store/interactions';
import {accountSelector, sablierSelector, tokenSelector, web3Selector} from "../store/selectors";
import {makeStyles} from "@material-ui/core/styles";
import {
    sablierStreamBalances
} from '../store/interactions';
import ConfirmationDialog from '../commons/ConfirmationDialog';
import {ChevronLeft} from "@material-ui/icons";

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    formButtons: {
        width: '100%'
    },
    formButton: {
        width: '50%'
    },
    gridMargin: {
        marginBottom: '20px'
    }
});

function StreamInfo() {

    let {id} = useParams();

    const dispatch = useDispatch();

    const account = useSelector(accountSelector);
    const web3 = useSelector(web3Selector);
    const sablier = useSelector(sablierSelector);

    const [openCancellationWarning, SetCancellationWarning] = useState(false);
    const [isCancellingStream, SetIsCancellingStream] = useState(false);
    const [isWithdrawing, SetIsWithdrawing] = useState(false);

    const [balanceDetails, SetBalanceDetails] = useState({
        senderBalance: 0,
        receiverBalance: 0
    });

    const classes = useStyles();

    const getStreamInfo = gql`
        query GetStreamInfo {
            stream(id: ${id}) {
                deposit
                id
                ratePerSecond
                recipient
                sender
                recipient
                startTime
                stopTime
                cancellation {
                    id
                    recipientBalance
                    senderBalance
                    timestamp
                    txhash
                }
                token {
                    id
                    name
                    decimals
                }
                withdrawals {
                    id
                    amount
                    timestamp
                    txhash
                }
            }

        }
    `;


    const onCompleted = async (data) => {
        try {
            let balancesInfo = await sablierStreamBalances(dispatch, sablier, web3, data.stream.id, data.stream.sender, data.stream.recipient, account)
            SetBalanceDetails(balancesInfo);
        } catch (Err) {

        }

    }

    const {loading, error, data, refetch} = useQuery(getStreamInfo, {
        onCompleted
    });

    const withdrawAmountNow = async () => {
        SetIsWithdrawing(true);
        try {
            // data.stream.deposit;
            await withdrawSablierFromStream(dispatch, sablier, web3, account, id, balanceDetails.receiverBalance);
            setTimeout(() => {
                refetch();
            }, 5000)
            SetIsWithdrawing(false);
        } catch (Err) {
            console.log(Err);
            SetIsWithdrawing(false);

        }
    }

    const askCancelStreamingNow = () => {
        SetCancellationWarning(true);
    }

    const cancelStreamingNow = async () => {
        try {
            SetIsCancellingStream(true);
            await cancelSablierStream(dispatch, sablier, id, account);
        } catch (Err) {
        }
        SetIsCancellingStream(false);
        SetCancellationWarning(false);
    }

    const handleClose = () => {
        SetCancellationWarning(false);
    }

    const cancelStreamTemplate = () => {
        let currentTime = new Date().getTime() / 1000;
        let streamData = data && data.stream;
        if (!streamData) {
            return;
        }

        if (currentTime > streamData.stopTime) {
            return <div>
                Streaming is already completed
            </div>;
        }

        let isStartedStreaming = currentTime > streamData.startTime;
        let completedStreamingPercentage = Math.round(((currentTime - streamData.startTime) * 100) / (streamData.stopTime - streamData.startTime));
        return <div>
            Are you sure you want to cancel streaming?
            {isStartedStreaming ? `Streaming has already started and ${completedStreamingPercentage} % is completed` : `Streaming hasn't Started Yet`}
        </div>
    }

    return <Fragment>
        <ConfirmationDialog
            handleClose={handleClose}
            open={openCancellationWarning}
            isInAction={isCancellingStream}
            actionEvent={cancelStreamingNow}
            title={'Cancel Stream ' + id}
            content={cancelStreamTemplate()}
        />
        <Grid container style={{justifyContent: 'center', marginTop: '30px'}}>
            <Grid item xs={11} sm={9} md={7} lg={5} className={classes.gridMargin}>
                <Button
                    component={Link}
                    to="/"
                    variant="outlined"
                >
                    <ChevronLeft/>
                    <strong>Back</strong>
                </Button>
                <br/>
                {loading && <p>Loading...</p>}
                {error && <p>Error :(</p>}
            </Grid>
            <Grid item xs={12}/>
            {!loading && !error && data.stream && <Fragment>
                <Grid item xs={11} sm={9} md={7} lg={5} className={classes.gridMargin}>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="caption table">
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2} align="center" style={{fontSize: '20px'}}>
                                        <strong>Stream Details</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow key="stream_id">
                                    <TableCell align="left">Stream Id</TableCell>
                                    <TableCell align="right">{data.stream.id}</TableCell>
                                </TableRow>
                                <TableRow key="stream_receiver">
                                    <TableCell align="left">Receiver</TableCell>
                                    <TableCell align="right">{data.stream.recipient}</TableCell>
                                </TableRow>
                                <TableRow key="stream_initial_amount">
                                    <TableCell align="left">Initial Amount</TableCell>
                                    <TableCell
                                        align="right">{(data.stream.deposit / (10 ** data.stream.token.decimals)).toFixed(4)}</TableCell>
                                </TableRow>
                                <TableRow key="stream_start_time">
                                    <TableCell align="left">Start Time</TableCell>
                                    <TableCell
                                        align="right">{moment(data.stream.startTime * 1000).format('DD MMM YYYY HH:mm')}</TableCell>
                                </TableRow>
                                <TableRow key="stream_stop_time">
                                    <TableCell align="left">Completion Time</TableCell>
                                    <TableCell
                                        align="right">{moment(data.stream.stopTime * 1000).format('DD MMM YYYY HH:mm')}</TableCell>
                                </TableRow>
                                {data.stream.cancellation && <TableRow key="stream_cancellation">
                                    <TableCell align="center" colSpan={2}>
                                        This Streaming was cancelled
                                        on {moment(data.stream.cancellation.timestamp * 1000).format('DD MMM YYYY HH:mm')}
                                    </TableCell>
                                </TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={12}/>
                <Grid item xs={11} sm={9} md={7} lg={5} className={classes.gridMargin}>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="caption table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center" style={{fontSize: '20px'}}><strong>Withdrawal
                                        History</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.stream.withdrawals.map((withdraw) => (
                                    <TableRow key={withdraw.id}>
                                        <TableCell align="left">
                                            <b>{(withdraw.amount / (10 ** data.stream.token.decimals)).toFixed(4)} {data.stream.token.name} </b> Was
                                            withdrawn
                                            on <b>{moment(withdraw.timestamp * 1000).format('DD MMM YYYY HH:mm')}</b>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={12}/>
                {!data.stream.cancellation && <Grid item xs={11} sm={9} md={7} lg={5} className={classes.gridMargin}>
                    <ButtonGroup className={classes.formButtons}>
                        <Button
                            className={classes.formButton}
                            variant="contained"
                            color="primary"
                            disabled={balanceDetails.receiverBalance === 0 || isWithdrawing}
                            onClick={withdrawAmountNow}
                        >
                            {isWithdrawing? <CircularProgress/>: 'Withdraw'}

                        </Button>
                        <Button
                            className={classes.formButton}
                            variant="contained"
                            color="secondary"
                            onClick={askCancelStreamingNow}
                        >
                            Cancel Streaming
                        </Button>
                    </ButtonGroup>
                </Grid>}
                <Grid item xs={12}/>
            </Fragment>}
        </Grid>
    </Fragment>

}

export default StreamInfo;