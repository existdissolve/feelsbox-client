import {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import {graphql} from 'react-apollo';
import {cloneDeep, get, isEmpty, pick, set, uniq} from 'lodash';
import {withStyles} from '@material-ui/core/styles';
import {
    GridList,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography
} from '@material-ui/core';
import {
    Add as AddIcon,
    ClearAll as ClearAllIcon,
    Close as CloseIcon,
    FlipToBack as FlipToBackIcon,
    LibraryAdd as LibraryAddIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
    PhotoAlbum as PhotoAlbumIcon,
    Save as SaveIcon,
    SettingsRemote as SettingsRemoteIcon,
    SettingsRemoteOutlined as SettingsRemoteOutlinedIcon,
    Undo as UndoIcon
} from '@material-ui/icons';

import {AppBar, Dialog, IconButton} from '-/components/shared';
import Pixel from '-/components/canvas/Pixel';
import Feelsbox from '-/components/canvas/picker/Feelsbox';
import Form from '-/components/canvas/Form';
import FrameForm from '-/components/canvas/FrameForm';
import {addFeel, editFeel, getFeel, getFeels, testFeel} from '-/graphql/feel';

const styles = theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
    },
    root: {
        display: 'flex',
        backgroundColor: theme.palette.background.paper,
        'overscroll-behavior': 'contain',
        flex: 1,
        flexDirection: 'column',
        flexWrap: 'nowrap',
        overflow: 'hidden'
    },
    toolbar: {
        backgroundColor: '#222'
    },
    frameCount: {
        flex: 1,
        paddingRight: 15,
        textAlign: 'right'
    },
    gridList: {
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'row',
        flexFlow: 'row wrap',
        alignItems: 'stretch',
        alignContent: 'flex-start',
        width: '100%',
        flex: '0 0 auto',
        margin: '0px !important'
    }
});

const scrubData = source => {
    const clonedSource = cloneDeep(source);
    const data = pick(clonedSource, ['_id', 'categories', 'duration', 'frames', 'name', 'private', 'repeat', 'reverse']);
    const {categories = [], duration, frames = []} = data;

    data.categories = categories.map(category => {
        if (typeof category === 'object') {
            return category._id;
        } else {
            return category;
        }
    });
    data.duration = parseInt(duration) || 0;
    data.frames = frames.map(frame => {
        const cleanFrame = pick(frame, ['brightness', 'duration', 'isThumb', 'pixels']);
        const {pixels = []} = cleanFrame;

        cleanFrame.pixels = pixels.map(pixel => {
            return pick(pixel, ['color', 'position']);
        });

        return cleanFrame;
    });

    return data;
};

const findPixel = (index, pixel) => {
    return pixel.position === index;
};

class CanvasGrid extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeFeelId: null,
            anchorEl: null,
            currentFrame: 0,
            data: {},
            frames: [],
            frameTestOpen: false,
            history: [],
            livePixels: [],
            open: false,
            selectedColor: '#ffffff',
            testDuration: 1000,
            testRepeat: false,
            testReverse: false,
            thumbIndex: 0
        };
    }

    componentDidUpdate(prevProps) {
        const {activeFeelId} = this.state;
        const feel = get(this.props, 'data.feel');
        const incomingId = get(prevProps, 'data.feel._id');
        const currentId = get(feel, '_id');

        if (!activeFeelId || (currentId && currentId !== incomingId)) {
            const pixels = get(feel, 'frames[0].pixels', []);
            const frames = get(feel, 'frames', []);
            const thumbIndex = frames.findIndex(frame => frame.isThumb);

            this.setState({
                activeFeelId: currentId || 'new',
                currentFrame: 0,
                data: scrubData(feel),
                frames: frames.slice(),
                history: [],
                livePixels: pixels.slice(),
                open: false,
                thumbIndex: thumbIndex === -1 ? 0 : thumbIndex
            });
        }
    }

    handleChangeComplete(color) {
        this.setState({
            selectedColor: color
        });
    }

    onDataChange = e => {
        const target = get(e, 'target', {});
        const {checked, name, type, value} = target;
        const {data} = this.state;

        this.setState({
            data: {
                ...data,
                [name]: type === 'checkbox' ? checked : value
            }
        });
    };

    onFramesTestChange = e => {
        const target = get(e, 'target', {});
        const {checked, name, type, value} = target;

        this.setState({
            [name]: type === 'checkbox' ? checked : value
        });
    };

    onThumbClick = () => {
        const {currentFrame, data: oldData, frames: oldFrames} = this.state;
        const data = cloneDeep(oldData);
        const frames = cloneDeep(oldFrames);
        const currentThumbIndex = frames.findIndex(frame => frame.isThumb);
        const oldThumbIndex = currentThumbIndex === -1 ? 0 : currentThumbIndex;

        let thumbIndex = currentFrame;

        if (currentFrame === oldThumbIndex) {
            // index is the same, undo it and reset to zero
            set(data, `frames.${currentFrame}.isThumb`, false);
            set(frames, `${currentFrame}.isThumb`, false);
            // set on zero index
            set(data, 'frames.0.isThumb', true);
            set(frames, '0.isThumb', true);

            thumbIndex = 0;
        } else {
            // index is different; undo on previous index and set to current frame
            set(data, `frames.${oldThumbIndex}.isThumb`, false);
            set(frames, `${oldThumbIndex}.isThumb`, false);
            // set to new index
            set(data, `frames.${currentFrame}.isThumb`, true);
            set(frames, `${currentFrame}.isThumb`, true);
        }

        this.setState({data, frames, thumbIndex});
    };

    onSaveClick = async() => {
        const {addFeel, editFeel, history} = this.props;
        const {data: originalData, frames} = this.state;
        const {_id, ...rest} = originalData;
        const rawData = {
            ...rest,
            frames
        };
        const data = scrubData(rawData);

        if (_id) {
            await editFeel({
                variables: {_id, data}
            });
        } else {
            const result = await addFeel({
                refetchQueries: [{
                    fetchPolicy: 'network-only',
                    query: getFeels
                }],
                variables: {data}
            });
            const newFeelId = get(result, 'data.addFeel._id');

            history.push(`/canvas/${newFeelId}`);
        }

        this.onDialogClose();
    };

    onTestClick = () => {
        const {testFeel} = this.props;
        const {currentFrame, frames} = this.state;
        const feel = pick(scrubData({frames}), ['frames']);

        feel.frames = [feel.frames[currentFrame]];

        testFeel({
            variables: {feel}
        });
    };

    onFramesTestClick = () => {
        const {testFeel} = this.props;
        const {frames, testDuration: duration, testRepeat: repeat, testReverse: reverse} = this.state;
        const feel = pick(scrubData({frames}), ['frames']);

        testFeel({
            variables: {
                feel: {
                    ...feel,
                    duration: parseInt(duration),
                    repeat,
                    reverse
                }
            }
        });
    };

    onEditClick = () => {
        this.setState({open: true});
    };

    onDialogClose = () => {
        this.setState({open: false});
    };

    onFramesFormClose = () => {
        this.setState({frameTestOpen: false});
    };

    onClearClick = () => {
        const {currentFrame, frames: currentFrames} = this.state;
        const frames = currentFrames.slice();

        frames[currentFrame] = {pixels: []};

        this.setState({
            ...this.state,
            frames,
            livePixels: []
        });
    };

    onDuplicateClick = () => {
        const {currentFrame, frames, history} = this.state;
        const newHistory = cloneDeep(history);
        const newFrames = cloneDeep(frames);
        const newFrame = newFrames[currentFrame];
        const {pixels} = newFrame;
        const newPixelState = cloneDeep(pixels);
        const nextFrame = frames.length;

        newHistory[nextFrame] = [newPixelState];
        newFrames[nextFrame] = cloneDeep(newFrame);

        this.setState({
            ...this.state,
            currentFrame: nextFrame,
            frames: newFrames,
            history: newHistory,
            livePixels: newPixelState
        }, this.onMenuClose);
    };

    onAddClick = () => {
        const {currentFrame, frames, history} = this.state;
        const newHistory = history.slice();
        const newFrames = frames.slice();
        const nextFrame = currentFrame + 1;

        newHistory[nextFrame] = [];
        newFrames[nextFrame] = {pixels: []};

        this.setState({
            ...this.state,
            currentFrame: nextFrame,
            frames: newFrames,
            history: newHistory,
            livePixels: []
        }, this.onMenuClose);
    };

    onRemoveClick = () => {
        const {currentFrame, frames, history} = this.state;
        const newHistory = history.slice();
        const newFrames = frames.slice();
        const nextFrame = currentFrame === 0 ? 0 : currentFrame - 1;

        newHistory.splice(currentFrame, 1);
        newFrames.splice(currentFrame, 1);

        const livePixels = get(newFrames, `${nextFrame}.pixels`, []);

        this.setState({
            ...this.state,
            currentFrame: nextFrame,
            frames: newFrames,
            history: newHistory,
            livePixels
        }, this.onMenuClose);
    };

    onNextClick = () => {
        // FIXME: Prevent out of bounds or wrap
        const {currentFrame, frames} = this.state;
        const nextFrame = currentFrame + 1;
        const livePixels = get(frames, `${nextFrame}.pixels`, []);

        this.setState({
            ...this.state,
            currentFrame: nextFrame,
            livePixels: livePixels.slice()
        });
    };

    onPreviousClick = () => {
        // FIXME: Prevent out of bounds or wrap
        const {currentFrame, frames} = this.state;
        const prevFrame = currentFrame - 1;
        const livePixels = get(frames, `${prevFrame}.pixels`, []);

        this.setState({
            ...this.state,
            currentFrame: prevFrame,
            livePixels: livePixels.slice()
        });
    };

    onUndoClick = () => {
        const {currentFrame, frames: originalFrames, history: originalHistory} = this.state;
        const completeHistory = originalHistory.slice();
        const frames = originalFrames.slice();
        const history = completeHistory[currentFrame];
        const lastPixelState = history.pop();

        frames[currentFrame] = {pixels: lastPixelState};

        if (lastPixelState) {
            this.setState({
                ...this.state,
                frames,
                livePixels: lastPixelState,
                history: completeHistory
            });
        }
    };

    onPixelTap(index, drawnIndices = []) {
        const {
            currentFrame,
            selectedColor,
            frames = [],
            history = [],
            livePixels = []
        } = this.state;

        if (!selectedColor.hex) {
            return;
        }

        const newHistory = history.slice();
        const oldFrames = cloneDeep(frames);
        const newFrames = cloneDeep(frames);
        const color = selectedColor.hex.toUpperCase().replace('#', '');
        const pixelsToColor = drawnIndices.length ? drawnIndices : [index];
        // old pixel state is authoritative version of last true state
        const oldPixelState = get(oldFrames, `${currentFrame}.pixels`, []);
        // new pixel state is current "live" state of pixels
        // we differentiate because multiple pixels could be added via drag, and we want
        // to be able to undo them in one action, instead of one by one
        const newPixelState = livePixels.slice();

        pixelsToColor.forEach(idx => {
            const pixel = newPixelState.find(findPixel.bind(null, idx));

            if (pixel) {
                pixel.color = color;
            } else {
                newPixelState.push({
                    color,
                    position: idx
                });
            }
        });

        if (!newHistory[currentFrame]) {
            newHistory[currentFrame] = [];
        }

        if (!isEmpty(oldPixelState)) {
            newHistory[currentFrame].push(oldPixelState);
        } else {
            newHistory[currentFrame].push([]);
        }

        set(newFrames, `${currentFrame}.pixels`, newPixelState);

        this.setState({
            ...this.state,
            frames: newFrames,
            history: newHistory,
            livePixels: newPixelState
        });
    }

    onPressAndHold(index) {
        const {currentFrame, frames, history, livePixels} = this.state;
        const newHistory = history.slice();
        const newFrames = frames.slice();
        // old pixel state is authoritative version of state
        // we'll use it to create a history item
        const oldPixelState = get(newFrames, `${currentFrame}.pixels`, []);
        // new pixel state represents the "live" state of pixels
        // could be different because of bulk adds via drag
        const newPixelState = livePixels.slice();
        const pixelIndex = newPixelState.findIndex(findPixel.bind(null, index));

        if (pixelIndex !== -1) {
            newPixelState.splice(pixelIndex, 1);
        }

        if (!isEmpty(oldPixelState)) {
            if (!newHistory[currentFrame]) {
                newHistory[currentFrame] = [];
            }

            newHistory[currentFrame].push(oldPixelState);
        }

        set(newFrames, `${currentFrame}.pixels`, newPixelState);

        this.setState({
            ...this.state,
            frames: newFrames,
            history: newHistory,
            livePixels: newPixelState
        });
    }

    onDragMove(index) {
        const {livePixels, selectedColor: currentColor} = this.state;

        if (!currentColor.hex) {
            return;
        }

        const selectedColor = currentColor.hex.toUpperCase();
        const newPixelState = livePixels.slice();
        const pixel = newPixelState.find(findPixel.bind(null, index));
        const color = selectedColor.replace('#', '');

        if (pixel) {
            pixel.color = color;
        } else {
            newPixelState.push({
                color,
                position: index
            });
        }

        // here, we only update the livePixels state
        // normal "pixels" state will be left alone so we can use it in history tracking
        this.setState({
            ...this.state,
            livePixels: newPixelState
        });
    }

    onFrameMenuClick = e => {
        const {currentTarget: anchorEl} = e;

        this.setState({anchorEl});
    };

    onMenuClose = () => {
        this.setState({anchorEl: null});
    };

    onTestFramesClick = () => {
        this.setState({frameTestOpen: true});
    };

    onTestFramesMenuClose = () => {
        this.setState({frameTestOpen: false});
    };

    renderIcons() {
        const {frames = []} = this.state;

        return (
            <Fragment>
                <IconButton Icon={SettingsRemoteIcon} onClick={this.onTestClick} title="Test on default device" />
                {frames.length > 1 &&
                    <IconButton Icon={SettingsRemoteOutlinedIcon} onClick={this.onTestFramesClick} title="Test animation on default device" />
                }
                <IconButton Icon={SaveIcon} onClick={this.onEditClick} title="Save Feel" />
            </Fragment>
        );
    }

    render() {
        const {classes} = this.props;
        const nodes = Array(64).fill(true);
        const {anchorEl, currentFrame, data, frames = [], frameTestOpen, history, livePixels, open, selectedColor, testDuration, testRepeat, testReverse, thumbIndex = 0} = this.state;
        const _id = get(this.props, 'match.params._id');
        const frameHistory = history[currentFrame] || [];
        const frameCount = frames.length || 1;
        const isUndoActive = frameHistory.length;
        const isNextActive = frameCount > (currentFrame + 1);
        const isPrevActive = currentFrame !== 0;
        const isDeleteActive = frameCount > 1;
        const isThumb = currentFrame === thumbIndex;
        const presetColors = uniq(livePixels.map(pixel => {
            const {color} = pixel;

            return `#${color}`;
        }));

        const extraContent = (
            <Toolbar className={classes.toolbar} variant="dense" disableGutters={true}>
                <IconButton Icon={UndoIcon} onClick={this.onUndoClick} disabled={!isUndoActive} title="Undo" />
                <IconButton Icon={ClearAllIcon} onClick={this.onClearClick} disabled={!isUndoActive} title="Clear pixels" />
                <IconButton Icon={NavigateBeforeIcon} onClick={this.onPreviousClick} disabled={!isPrevActive} title="Go to previous frame" />
                <IconButton Icon={NavigateNextIcon} onClick={this.onNextClick} disabled={!isNextActive} title="Go to next frame" />
                <IconButton Icon={LibraryAddIcon} onClick={this.onFrameMenuClick} title="Add/Copy/Remove frame" />
                {frames.length > 1 &&
                    <IconButton Icon={PhotoAlbumIcon} color={isThumb ? 'secondary' : 'action'} onClick={this.onThumbClick} title="Make thumbnail" />
                }
                <Typography variant="button" className={classes.frameCount}>{currentFrame + 1} / {frameCount}</Typography>
            </Toolbar>
        );

        return (
            <div className={classes.container}>
                <AppBar title={_id ? 'Edit Emoji' : 'Create Emoji'} iconRenderer={this.renderIcons()} extraContent={extraContent} position="relative" />
                <Menu anchorEl={anchorEl} keepMounted={false} open={Boolean(anchorEl)} onClose={this.onMenuClose}>
                    <MenuItem onClick={this.onAddClick}>
                        <ListItemIcon>
                            <AddIcon />
                        </ListItemIcon>
                        <ListItemText primary="Add Frame" />
                    </MenuItem>
                    <MenuItem onClick={this.onDuplicateClick}>
                        <ListItemIcon>
                            <FlipToBackIcon />
                        </ListItemIcon>
                        <ListItemText primary="Copy Frame" />
                    </MenuItem>
                    {isDeleteActive &&
                        <MenuItem onClick={this.onRemoveClick}>
                            <ListItemIcon>
                                <CloseIcon />
                            </ListItemIcon>
                            <ListItemText primary="Remove Frame" />
                        </MenuItem>
                    }
                </Menu>
                <Dialog
                    cancelBtnText="Close"
                    cancelHandler={this.onFramesFormClose}
                    closeHandler={this.onFramesFormClose}
                    okBtnText="Test"
                    okHandler={this.onFramesTestClick}
                    open={frameTestOpen}
                    title="Test All Frames">
                    <FrameForm onChange={this.onFramesTestChange} duration={testDuration} repeat={testRepeat} reverse={testReverse} />
                </Dialog>
                <Dialog
                    cancelHandler={this.onDialogClose}
                    closeHandler={this.onDialogClose}
                    okBtnText="Save"
                    okHandler={this.onSaveClick}
                    open={open}
                    title="Save Feel">
                    <Form onChange={this.onDataChange} formData={data} frames={frames} />
                </Dialog>
                <div className={classes.root}>
                    <GridList className={classes.gridList} cols={8}>
                        {nodes.map((item, index) => {
                            const pixel = livePixels.find(pixel => pixel.position === index) || {};
                            const {color} = pixel;

                            return (
                                <Pixel
                                    key={index}
                                    index={index}
                                    color={color}
                                    row={Math.floor(index / 8)}
                                    onTap={this.onPixelTap.bind(this)}
                                    onPressAndHold={this.onPressAndHold.bind(this)}
                                    onDragMove={this.onDragMove.bind(this)} />
                            );
                        })}
                    </GridList>
                    <Feelsbox
                        color={selectedColor}
                        disableAlpha={true}
                        presetColors={presetColors}
                        onChangeComplete={this.handleChangeComplete.bind(this)} />
                </div>
            </div>
        );
    }
}

CanvasGrid.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withRouter(
    compose(
        graphql(getFeel, {
            options: props => ({
                notifyOnNetworkStatusChange: true,
                variables: {
                    _id: get(props, 'match.params._id')
                }
            })
        }),
        graphql(addFeel, {name: 'addFeel'}),
        graphql(editFeel, {name: 'editFeel'}),
        graphql(testFeel, {name: 'testFeel'}),
        withStyles(styles)
    )(CanvasGrid)
);
