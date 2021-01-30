import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

export default props => {
    const {Icon, className, color, disabled, edge, onClick, size, title} = props;

    return (
        <Tooltip title={title}>
            <span>
                <IconButton className={className} onClick={onClick} disabled={disabled} edge={edge} size={size}>
                    <Icon color={color} />
                </IconButton>
            </span>
        </Tooltip>
    );
};
