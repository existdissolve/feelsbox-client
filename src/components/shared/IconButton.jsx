import {IconButton, Tooltip} from '@material-ui/core';

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
