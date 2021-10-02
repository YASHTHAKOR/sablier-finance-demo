import {Fragment, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Controller, useForm} from "react-hook-form";
import {withStyles} from '@material-ui/core/styles';

import {
    web3Selector,
    tokenSelector,
    accountSelector,
    sablierSelector,
    tokenBalanceSelector,
    networkIdSelector,
    tokenBasicsSelector
} from '../store/selectors';
import {
    approveToken,
    createSablierStream
} from '../store/interactions';
import {
    Button,
    Container,
    TextField,
    Grid,
    Dialog,
    DialogTitle as MuiDialogTitle,
    DialogContent as MuiDialogContent,
    DialogActions as MuiDialogActions,
    IconButton,
    CircularProgress,
    Typography, TableContainer, Paper, Table, TableRow, TableCell, ButtonGroup
} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import {useState} from "react";
import Streams from './Streams';
import moment from "moment";
import Alert from '../commons/Alert';
import {gql, useQuery} from "@apollo/client";

const styles = (theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    accountTopBar: {
        padding: '10px 0',
        marginBottom: '20px',
        boxShadow: '0 0 10px 5px rgba(0, 0, 0, 0.2)',
        background: '#fff',
        position: 'relative',
        '& .MuiContainer-root': {
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection:'row'
        }
    },
    formContainer: {
        background: '#fff',
        position: 'relative',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)'
    },
    headerDiv: {
      width: "20%",
        textAlign: "center"
    },
    formButtons: {
        width: '100%'
    },
    formButton: {
        width: '50%'
    }
});

const DialogTitle = withStyles(styles)((props) => {
    const {children, classes, onClose, ...other} = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon/>
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions);

const networkNames = {
    1: 'Ethereum Mainnet',
    42: 'Kovan Test Net',
    0: 'Loading...'
}


function Main({ classes }) {

    const account = useSelector(accountSelector);
    const token = useSelector(tokenSelector);
    const web3 = useSelector(web3Selector);
    const sablier = useSelector(sablierSelector);
    const tokenBalance = useSelector(tokenBalanceSelector);
    const networkId = useSelector(networkIdSelector);
    const tokenBasics = useSelector(tokenBasicsSelector);

    const dispatch = useDispatch();

    const {handleSubmit, reset, control, formState: {errors}} = useForm();
    const [isCreatingPaymentStream, SetIsCreatingPaymentStream] = useState(false);
    const [open, SetOpen] = useState(false);
    const [finalStreamingData, SetFinalStreamingData] = useState({});
    const [alertOpen, SetAlertOpen] = useState(false);

    const getStreamInfo = gql`
        query GetStreams {
         streams(where: { sender: "${account}" }) {
            id
            ratePerSecond
            deposit
            recipient
            sender
            startTime
            stopTime
            token {
              id
              name
              decimals
            }
            cancellation {
             id
             recipientBalance
             senderBalance
             timestamp
             txhash
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

    const getReceivingStreamInfo = gql`
        query GetStreams {
         streams(where: { recipient: "${account}" }) {
            id
            ratePerSecond
            deposit
            recipient
            sender
            startTime
            stopTime
            token {
              id
              name
              decimals
            }
            cancellation {
             id
             recipientBalance
             senderBalance
             timestamp
             txhash
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

    const {loading, error, data, refetch} = useQuery(getStreamInfo);

    const {loading: receivingLoading, error: receivingError, data: receivingData, refetch: receivingRefetch} = useQuery(getReceivingStreamInfo);

    const onSubmit = async (data) => {
        // SetAlertOpen(true);

        try {
            let sablierData = {
                startTime: Math.round(new Date(data.startTime).getTime() / 1000),
                endTime:  Math.round(new Date(data.endTime).getTime() / 1000),
                amount: data.Amount * (10 ** 18),
                recipientAddress: data.recipientAddress
            }

            let BN = web3.utils.BN;

            let amountBN = new BN(sablierData.amount.toLocaleString().replace(/,/g, ''));

            let timeDiff = new BN(sablierData.endTime - sablierData.startTime);

            let remainder = amountBN.mod(timeDiff);

            let finalDepositAmount = amountBN.sub(remainder);

            let finalAmountString = finalDepositAmount.div(new BN((10 ** 18).toString()));

            let finalData = {
                recipient: sablierData.recipientAddress,
                deposit: finalDepositAmount.toString(),
                startTime: sablierData.startTime,
                stopTime: sablierData.endTime,
                remainder: remainder.toString(),
                finalAmountString: finalAmountString.toString(),
                finalDepositAmount: finalDepositAmount.toString()
            }

            SetFinalStreamingData(finalData);

            SetOpen(true);
        } catch (Err) {
        }
    }

    const startStreamingRequest = async () => {
        try {
            SetIsCreatingPaymentStream(true);
            let approvalHashData = await approveToken(
                dispatch,
                sablier,
                web3,
                token,
                finalStreamingData.finalDepositAmount,
                account
            );

            await createSablierStream(
                dispatch,
                sablier,
                web3,
                token,
                account, {
                    recipient: finalStreamingData.recipient,
                    deposit: finalStreamingData.finalDepositAmount,
                    startTime: finalStreamingData.startTime,
                    stopTime: finalStreamingData.stopTime
                }
            )
            SetIsCreatingPaymentStream(false);
            SetOpen(false);
            reset({recipientAddress: '', Amount: '', startTime: new Date(), endTime: new Date()});
            setTimeout(() => {
                refetch();
            }, 5000)
        } catch (Err) {
            SetIsCreatingPaymentStream(false);

        }
    }

    const handleClose = (event, reason) => {
        if (reason !== 'backdropClick') {
            SetOpen(false);
        }
    }

    const DialogRender = () => {
        return <div>
            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Streaming Token Confirmation
                </DialogTitle>
                <DialogContent dividers>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="caption table">
                            <TableRow>
                                <TableCell align="center">Receiver</TableCell>
                                <TableCell align="center">{finalStreamingData.recipient}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">Final AMount(Amount after deducting reminder)</TableCell>
                                <TableCell
                                    align="center">{(finalStreamingData.finalDepositAmount / (10 ** 18))}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">Subtracted Amount</TableCell>
                                <TableCell align="center">{finalStreamingData.remainder} WEI</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">Start Time</TableCell>
                                <TableCell
                                    align="center">{moment(finalStreamingData.startTime * 1000).format('DD MMM YYYY HH:mm')}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">End TIme</TableCell>
                                <TableCell
                                    align="center">{moment(finalStreamingData.stopTime * 1000).format('DD MMM YYYY HH:mm')}</TableCell>
                            </TableRow>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus disabled={isCreatingPaymentStream} onClick={startStreamingRequest}
                            color="primary">
                        {isCreatingPaymentStream ? <CircularProgress/> : ' Stream Token'}

                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    }

    const handleAlertOpen = () => {
        SetAlertOpen(false);
    }

    return <Fragment>
        <Grid container className={classes.accountTopBar}>
            <div className={classes.headerDiv}></div>
            <div className={classes.headerDiv}>
                <span> Your address</span> <br/>
                <span> <b>{account}</b></span>
            </div>
            <div className={classes.headerDiv}>
                <span> Network</span> <br/>
                <span> {networkNames[networkId]}</span>
            </div>
            <div className={classes.headerDiv}>
                <span> Your Balance</span> <br/>
                <span> <b>{(tokenBalance / 10 ** 18).toFixed(4)} {tokenBasics.name}</b></span>
            </div>
            <div className={classes.headerDiv}>

            </div>
            {/*<Container>*/}
            {/*    <span>Your Address</span>*/}
            {/*    <span>Your Balance</span>*/}
            {/*</Container>*/}
            {/*<Container>*/}
            {/*    <strong>{account}</strong>*/}
            {/*    <strong>{(tokenBalance / 10 ** 18).toFixed(4)}</strong>*/}
            {/*</Container>*/}
        </Grid>
        <Container>
            <Grid container className={classes.formContainer}>
                <Grid item xs={12} style={{ margin: 'auto' }}>
                    <Alert
                        message={'Stream Added Successfully'}
                        handleClose={handleAlertOpen}
                        open={alertOpen}
                        severity={"success"}
                    />
                </Grid>
                <Grid item xs={12}/>
                <Grid item xs={12}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid container>
                            <Grid item xs={12} md={6}>
                                <Controller
                                    name={"recipientAddress"}
                                    control={control}
                                    rules={{required: true}}
                                    render={({field}) => (
                                        <TextField  {...field} label={"Recipient Address"} variant="outlined" fullWidth
                                                    margin={"dense"}/>
                                    )}
                                />
                                {errors.recipentAddress && <span>This is required.</span>}
                                <br/>
                                <Controller
                                    name={"startTime"}
                                    control={control}
                                    rules={{required: true}}
                                    render={({field: {onChange, value}}) => (
                                        <TextField
                                            onChange={onChange} value={value}
                                            id="datetime-local"
                                            label="Start Time"
                                            type="datetime-local"
                                            fullWidth
                                            variant="outlined"
                                            margin={"dense"}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Controller
                                    name={"Amount"}
                                    control={control}
                                    rules={{required: true}}
                                    render={({field: {onChange, value}}) => (
                                        <TextField onChange={onChange} value={value} label={"Amount"} variant="outlined"
                                                   fullWidth margin={"dense"}/>
                                    )}
                                />
                                <br/>
                                <Controller
                                    name={"endTime"}
                                    control={control}
                                    rules={{required: true}}
                                    render={({field: {onChange, value}}) => (
                                        <TextField
                                            onChange={onChange} value={value}
                                            id="datetime-local"
                                            label="End Time"
                                            type="datetime-local"
                                            fullWidth
                                            variant="outlined"
                                            margin={"dense"}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} style={{ marginTop: '10px' }}>
                                <ButtonGroup variant="contained" className={classes.formButtons}>
                                    <Button
                                        type="submit"
                                        className={classes.formButton}
                                    >Submit</Button>
                                    <Button
                                        className={classes.formButton}
                                        onClick={() => reset({
                                            recipientAddress: '',
                                            Amount: '',
                                            startTime: new Date(),
                                            endTime: new Date()
                                        })}
                                        variant={"outlined"}
                                    >Reset</Button>
                                </ButtonGroup>
                            </Grid>
                        </Grid>

                        {DialogRender()}
                    </form>
                </Grid>
            </Grid>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <h4>Created Streams</h4>
                </Grid>
            </Grid>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    {!loading && !error && <Streams data={data.streams}/>}
                </Grid>
            </Grid>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <h4>Receiving Streams</h4>
                </Grid>
            </Grid>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    {!receivingLoading && !receivingError && <Streams data={receivingData.streams} receiver={true}/>}
                </Grid>
            </Grid>
        </Container>
    </Fragment>

}

export default withStyles(styles)(Main);