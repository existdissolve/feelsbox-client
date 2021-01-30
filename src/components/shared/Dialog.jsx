import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@material-ui/core';

export default props => {
    const emptyFn = () => {};
    const {
        cancelBtnText = 'Cancel',
        cancelHandler,
        children,
        className,
        closeHandler = emptyFn,
        keepMounted = false,
        okBtnText = 'Submit',
        okHandler,
        open = false,
        text,
        title
    } = props;

    return (
        <Dialog open={open} onClose={closeHandler} keepMounted={keepMounted} className={className}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {text != null &&
                    <DialogContentText>{text}</DialogContentText>
                }
                {children}
            </DialogContent>
            {(cancelHandler || okHandler) &&
                <DialogActions>
                    {cancelHandler &&
                        <Button onClick={cancelHandler} color="default" variant="contained" size="small">
                            {cancelBtnText}
                        </Button>
                    }
                    {okHandler &&
                        <Button onClick={okHandler} color="secondary" variant="contained" size="small" autoFocus>
                            {okBtnText}
                        </Button>
                    }
                </DialogActions>
            }
        </Dialog>
    );
};
