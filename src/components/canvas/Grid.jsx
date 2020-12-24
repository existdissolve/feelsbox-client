import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import {graphql} from 'react-apollo';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import GridList from '@material-ui/core/GridList';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import {Typography} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import CloseIcon from '@material-ui/icons/Close';
import FlipToBackIcon from '@material-ui/icons/FlipToBack';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import SaveIcon from '@material-ui/icons/Save';
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote';
import SettingsRemoteOutlinedIcon from '@material-ui/icons/SettingsRemoteOutlined';
import TuneIcon from '@material-ui/icons/Tune';
import UndoIcon from '@material-ui/icons/Undo';
import {cloneDeep, get, isEmpty, pick, set, uniq} from 'lodash';

import AppBar from '-/components/AppBar';
import Pixel from '-/components/canvas/Pixel';
import Feelsbox from '-/components/canvas/picker/Feelsbox';
import Form from '-/components/canvas/Form';
import FrameForm from '-/components/canvas/FrameForm';
import TuneForm from '-/components/canvas/TuneForm';
import {addFeel, editFeel, getFeel, getFeels, testFeel} from '-/graphql/feel';

const styles = theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
    },
    root: {
        display: 'flex',
        //justifyContent: 'space-around',
        backgroundColor: theme.palette.background.paper,
        'overscroll-behavior': 'contain',
        flex: 1,
        //height: 'calc(100vh - 104px)',
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

class CanvasGrid extends React.Component {
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
            tuneOpen: false
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

            this.setState({
                activeFeelId: currentId || 'new',
                currentFrame: 0,
                data: scrubData(feel),
                frames: frames.slice(),
                history: [],
                livePixels: pixels.slice(),
                open: false
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

    onTuneChange = e => {
        const target = get(e, 'target', {});
        const {name, value} = target;
        const {currentFrame, data: oldData, frames: oldFrames} = this.state;
        const data = cloneDeep(oldData);
        const frames = cloneDeep(oldFrames);
        const finalValue = parseInt(value);

        set(data, `frames.${currentFrame}.${name}`, finalValue);
        set(frames, `${currentFrame}.${name}`, finalValue);

        this.setState({data, frames});
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

    onTuneClick = () => {
        this.setState({tuneOpen: true});
    };

    onTuneClose = () => {
        this.setState({tuneOpen: false});
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
            <React.Fragment>
                <IconButton onClick={this.onTestClick}>
                    <SettingsRemoteIcon />
                </IconButton>
                {frames.length > 1 &&
                    <IconButton onClick={this.onTestFramesClick}>
                        <SettingsRemoteOutlinedIcon />
                    </IconButton>
                }
                <IconButton onClick={this.onEditClick}>
                    <SaveIcon />
                </IconButton>
            </React.Fragment>
        );
    }

    render() {
        const {classes} = this.props;
        const nodes = Array(64).fill(true);
        const {anchorEl, currentFrame, data, frames = [], frameTestOpen, history, livePixels, open, selectedColor, testDuration, testRepeat, testReverse, tuneOpen} = this.state;
        const _id = get(this.props, 'match.params._id');
        const frameHistory = history[currentFrame] || [];
        const frameCount = frames.length || 1;
        const isUndoActive = frameHistory.length;
        const isNextActive = frameCount > (currentFrame + 1);
        const isPrevActive = currentFrame !== 0;
        const isDeleteActive = frameCount > 1;
        const activeFrame = get(data, `frames.${currentFrame}`) || {};
        const {brightness: currentFrameBrightness, duration: currentFrameDuration} = activeFrame;
        const presetColors = uniq(livePixels.map(pixel => {
            const {color} = pixel;

            return `#${color}`;
        }));

        return (
            <div className={classes.container}>
                <AppBar title={_id ? 'Edit Emoji' : 'Create Emoji'} iconRenderer={this.renderIcons()} />
                <Toolbar className={classes.toolbar} variant="dense" disableGutters={true}>
                    <IconButton onClick={this.onUndoClick} disabled={!isUndoActive}>
                        <UndoIcon />
                    </IconButton>
                    <IconButton onClick={this.onClearClick} disabled={!isUndoActive}>
                        <ClearAllIcon />
                    </IconButton>
                    <IconButton onClick={this.onPreviousClick} disabled={!isPrevActive}>
                        <NavigateBeforeIcon />
                    </IconButton>
                    <IconButton onClick={this.onNextClick} disabled={!isNextActive}>
                        <NavigateNextIcon />
                    </IconButton>
                    <IconButton onClick={this.onFrameMenuClick}>
                        <LibraryAddIcon />
                    </IconButton>
                    <IconButton onClick={this.onTuneClick}>
                        <TuneIcon />
                    </IconButton>
                    <Typography variant="button" className={classes.frameCount}>{currentFrame + 1} / {frameCount}</Typography>
                </Toolbar>
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
                <Dialog open={tuneOpen} onClose={this.onTuneClose} aria-labelledby="form-tune-title">
                    <DialogTitle id="form-tune-title">Frame Options</DialogTitle>
                    <DialogContent>
                        <TuneForm onChange={this.onTuneChange} hasMultipleFrames={frames.length > 1} brightness={currentFrameBrightness} duration={currentFrameDuration} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onTuneClose} color="primary">Close</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={frameTestOpen} onClose={this.onFramesFormClose} aria-labelledby="form-frame-title">
                    <DialogTitle id="form-frame-title">Test All Frames</DialogTitle>
                    <DialogContent>
                        <FrameForm onChange={this.onFramesTestChange} duration={testDuration} repeat={testRepeat} reverse={testReverse} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onFramesFormClose} color="primary">Close</Button>
                        <Button onClick={this.onFramesTestClick.bind(this)} color="primary">Test</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={open} onClose={this.onDialogClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Save Feel</DialogTitle>
                    <DialogContent>
                        <Form onChange={this.onDataChange} formData={data} frames={frames} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onDialogClose} color="primary">Cancel</Button>
                        <Button onClick={this.onSaveClick.bind(this)} color="primary">Save</Button>
                    </DialogActions>
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
