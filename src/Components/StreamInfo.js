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
    Button
} from "@material-ui/core";
import moment from 'moment';
import {
    useDispatch, useSelector
} from 'react-redux';
import {
    withdrawSablierFromStream
} from '../store/interactions';
import {accountSelector, sablierSelector, tokenSelector, web3Selector} from "../store/selectors";
import {makeStyles} from "@material-ui/core/styles";
import {
    sablierStreamBalances
} from '../store/interactions';

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
            debugger;
        }

    }

    const { loading, error, data } = useQuery(getStreamInfo, {
        onCompleted
    });

    const withdrawAmountNow = () => {
        withdrawSablierFromStream(dispatch,sablier, web3, account, id, data.stream.deposit)
    }

    return <Fragment>
        {loading && <p>Loading...</p>}
        {error && <p>Error :(</p>}
        {!loading && !error && data.stream && <Grid container spacing={3}>
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
                                                withdrawen on <b>{moment(withdraw.timestamp*1000).format('DD MMM YYYY HH:mm')}</b>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    <Grid item xs={12}>
                       <Button onClick={withdrawAmountNow}>
                            Withdraw
                       </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>}
    </Fragment>

}

export default StreamInfo;