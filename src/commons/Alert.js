import {
    Snackbar,
} from '@material-ui/core';

function Alert({
                   open,
                   handleClose,
                   message,
                   severity
               }) {

    return <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity}>
            {message}
        </Alert>
    </Snackbar>
}

export default Alert;
