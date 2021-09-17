import {Fragment, useState} from "react";
import {useParams} from 'react-router-dom';
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
    Container
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

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});

function StreamInfo() {

    let {id} = useParams();

    const dispatch = useDispatch();

    const account = useSelector(accountSelector);
    const token = useSelector(tokenSelector);
    const web3 = useSelector(web3Selector);
    const sablier = useSelector(sablierSelector);

    const [openCancellationWarning, SetCancellationWarning] = useState(false);
    const [isCancellingStream, SetIsCancellingStream] = useState(false);

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



    const onCompleted = async  (data) => {
        try {
            let balancesInfo = await sablierStreamBalances(dispatch, sablier, web3,data.stream.id,data.stream.sender, data.stream.recipient,account)
            SetBalanceDetails(balancesInfo);
        } catch (Err) {

        }

    }

    const { loading, error, data } = useQuery(getStreamInfo, {
        onCompleted
    });

    const withdrawAmountNow = () => {
        withdrawSablierFromStream(dispatch,sablier, web3, account, id, data.stream.deposit)
    }

    const askCancelStreamingNow = () => {
        SetCancellationWarning(true);
    }

    const cancelStreamingNow = async  () => {
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
        let currentTime = new Date().getTime()/1000;
        let streamData = data && data.stream;
        if(!streamData) {
            return;
        }

        if(currentTime > streamData.stopTime) {
            return <div>
                Streaming is already completed
            </div>;
        }

        let isStartedStreaming = currentTime > streamData.startTime;
        let completedStreamingPercentage = Math.round(((currentTime - streamData.startTime ) * 100) / (streamData.stopTime - streamData.startTime));
        return <div>
            Are you sure you want to cancel streaming?
            {isStartedStreaming? `Streaming has already started and ${completedStreamingPercentage} % is completed`: `Streaming hasn't Started Yet`}
        </div>
    }

    return <div>
        <ConfirmationDialog
            handleClose={handleClose}
            open={openCancellationWarning}
            isInAction={isCancellingStream}
            actionEvent={cancelStreamingNow}
            title={'Cancel Stream ' + id}
            content={cancelStreamTemplate()}
        />
        {loading && <p>Loading...</p>}
        {error && <p>Error :(</p>}
        {!loading && !error && data.stream && <Grid container spacing={3}>
            <Grid item xs={12}>
            </Grid>
            <Grid item xs={12}>
            </Grid>
            <Grid item xs={2}>
            </Grid>
            <Grid item xs={10}>
                <Grid container>
                    <Grid item xs={12}>
                        Stream Id {data.stream.id}
                    </Grid>
                    <Grid item xs={12}>
                        Receiver {data.stream.recipient}
                    </Grid>
                    <Grid item xs={12}>
                        Initial Amount {(data.stream.deposit/(10 ** data.stream.token.decimals)).toFixed(4)}
                    </Grid>
                    <Grid item xs={12}>
                        Start  Time {moment(data.stream.startTime*1000).format('DD MMM YYYY HH:mm')}
                    </Grid>
                    <Grid item xs={12}>
                        Completion Time {moment(data.stream.stopTime*1000).format('DD MMM YYYY HH:mm')}
                    </Grid>
                    {data.stream.cancellation && <Grid item xs={12}>
                       This Streaming was cancelled on {moment(data.stream.cancellation.timestamp*1000).format('DD MMM YYYY HH:mm')}
                    </Grid>}

                    <Grid item xs={6}>
                        <TableContainer component={Paper}>
                            <Table className={classes.table} aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">With Draw History</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.stream.withdrawals.map((withdraw) => (
                                        <TableRow key={withdraw.id}>
                                            <TableCell align="center">
                                               <b>{(withdraw.amount/(10 ** data.stream.token.decimals)).toFixed(4)} {data.stream.token.name} </b> Was
                                                withdrawn on <b>{moment(withdraw.timestamp*1000).format('DD MMM YYYY HH:mm')}</b>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    {!data.stream.cancellation && <Grid item xs={12}>
                       <Button variant="contained" color="primary" onClick={withdrawAmountNow}>
                            Withdraw
                       </Button>
                        <Button variant="contained" color="secondary" onClick={askCancelStreamingNow}>
                            Cancel Streaming
                        </Button>
                    </Grid>}
                    <Grid item xs={12}>
                        <Button variant="contained" color="primary" href={`https://pay.sablier.finance/stream/${id}`} target={"__blank"}>
                            Link
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>}
    </div>

}

export default StreamInfo;