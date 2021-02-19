import {Component, Fragment} from 'react';
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
    ArrowDropDown as ArrowDropDownIcon,
    ArrowDropUp as ArrowDropUpIcon,
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
    CenterFocusWeak as CenterFocusWeakIcon,
    Close as CloseIcon,
    FlipToBack as FlipToBackIcon,
    LibraryAdd as LibraryAddIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
    PhotoAlbum as PhotoAlbumIcon,
    Save as SaveIcon,
    SettingsRemote as SettingsRemoteIcon,
    SettingsRemoteOutlined as SettingsRemoteOutlinedIcon
} from '@material-ui/icons';

import {AppBar, Dialog, IconButton} from '-/components/shared';
import Pixel from '-/components/canvas/Pixel';
import Form from '-/components/canvas/Form';
import FrameForm from '-/components/canvas/FrameForm';
import {editFeel, testFeel} from '-/graphql/feel';

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
    },
    gridListPano: {
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'row',
        flexFlow: 'row wrap',
        alignItems: 'stretch',
        alignContent: 'flex-start',
        width: '100%',
        margin: '0px !important',
        height: '100%',
        padding: 10,
        overflow: 'hidden'
    }
});

const scrubData = source => {
    const clonedSource = cloneDeep(source);
    const data = pick(clonedSource, ['_id', 'categories', 'duration', 'name', 'panorama', 'private', 'repeat', 'reverse']);
    const {categories = [], duration, panorama} = data;

    data.panorama = pick(panorama, ['height', 'pixels', 'steps', 'width']);

    const steps = get(data, 'panorama.steps');
    const pixels = get(data, 'panorama.pixels', []);

    data.categories = categories.map(category => {
        if (typeof category === 'object') {
            return category._id;
        } else {
            return category;
        }
    });
    data.duration = parseInt(duration) || 0;
    data.panorama.pixels = pixels.map(pixel => {
        return pick(pixel, ['color', 'position']);
    });
    data.panorama.steps = steps.map(step => {
        const {terminal} = step;

        return {terminal};
    });

    return data;
};

const transpose = (pixels, definition = {}) => {
    const {start = 0, length = 20} = definition;
    const colCount = 8;
    const range = [];

    let startIdx = start;

    for (let x = 0; x < colCount; x++) {
        startIdx = startIdx + (x === 0 ? 0 : length);

        for (let y = 0; y < colCount; y++) {
            const {color} = pixels[startIdx + y];

            range.push({color, position: (x * colCount) + y});
        }
    }

    return range;
};

const getSelectionBox = (pixels, terminal, rowWidth) => {
    const colCount = 8;
    const selectionBox = {
        top: [],
        right: [],
        bottom: [],
        left: []
    };

    let startIdx = terminal;

    for (let x = 0; x < colCount; x++) {
        startIdx = startIdx + (x === 0 ? 0 : rowWidth);

        for (let y = 0; y < colCount; y++) {
            const idx = startIdx + y;

            if (x === 0) {
                selectionBox.top.push(idx);
            }

            if (y === 0) {
                selectionBox.left.push(idx);
            }

            if (x === colCount - 1) {
                selectionBox.bottom.push(idx);
            }

            if (y === colCount - 1) {
                selectionBox.right.push(idx);
            }
        }
    }

    return selectionBox;
};

class Panorama extends Component {
    constructor(props) {
        super(props);

        const feel = get(props, 'data.feel');
        const currentId = get(feel, '_id');
        const steps = get(feel, 'panorama.steps', []);
        console.log(steps)
        const terminal = get(feel, 'panorama.steps[0].terminal', 0);
        const transposedPixels = this.transpose(terminal);

        this.state = {
            activeFeelId: currentId,
            anchorEl: null,
            currentStep: 0,
            data: scrubData(feel),
            steps: steps.slice(),
            stepTestOpen: false,
            history: [],
            livePixels: transposedPixels,
            open: false,
            panoramaHeight: null,
            panoramaWidth: null,
            testDuration: 1000,
            testRepeat: false,
            testReverse: false,
            thumbIndex: 0
        };
    }

    componentDidMount() {
        const panoramaHeight = document.getElementById('panorama-preview').clientHeight;
        const panoramaWidth = document.getElementById('panorama-preview').clientWidth;

        this.setState({
            panoramaHeight,
            panoramaWidth
        });
    }

    transpose = terminal => {
        const feel = get(this.props, 'data.feel');
        const pixels = get(feel, 'panorama.pixels');
        const width = get(feel, 'panorama.width');
        const fixedPixels = transpose(pixels, {start: terminal, length: width});

        return cloneDeep(fixedPixels);
    };

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
        const {currentStep, data: oldData, frames: oldFrames} = this.state;
        const data = cloneDeep(oldData);
        const frames = cloneDeep(oldFrames);
        const currentThumbIndex = frames.findIndex(frame => frame.isThumb);
        const oldThumbIndex = currentThumbIndex === -1 ? 0 : currentThumbIndex;

        let thumbIndex = currentStep;

        if (currentStep === oldThumbIndex) {
            // index is the same, undo it and reset to zero
            set(data, `frames.${currentStep}.isThumb`, false);
            set(frames, `${currentStep}.isThumb`, false);
            // set on zero index
            set(data, 'frames.0.isThumb', true);
            set(frames, '0.isThumb', true);

            thumbIndex = 0;
        } else {
            // index is different; undo on previous index and set to current frame
            set(data, `frames.${oldThumbIndex}.isThumb`, false);
            set(frames, `${oldThumbIndex}.isThumb`, false);
            // set to new index
            set(data, `frames.${currentStep}.isThumb`, true);
            set(frames, `${currentStep}.isThumb`, true);
        }

        this.setState({data, frames, thumbIndex});
    };

    onSaveClick = async() => {
        const {editFeel} = this.props;
        const {data: originalData, steps} = this.state;
        const {_id, ...rawData} = originalData;

        set(rawData, 'panorama.steps', steps);

        const data = scrubData(rawData);

        await editFeel({
            variables: {_id, data}
        });

        this.onDialogClose();
    };

    onTestClick = () => {
        const {testFeel} = this.props;
        const {livePixels} = this.state;
        const feel = {
            frames: [{
                pixels: livePixels
            }]
        };

        testFeel({
            variables: {feel}
        });
    };

    onFramesTestClick = () => {
        const {testFeel} = this.props;
        const {steps, testDuration: duration, testRepeat: repeat, testReverse: reverse} = this.state;
        const frames = steps.map(step => {
            const {terminal} = step;
            const pixels = this.transpose(terminal);

            return {pixels};
        });

        testFeel({
            variables: {
                feel: {
                    frames,
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

    onDuplicateClick = () => {
        const {currentStep, steps, history} = this.state;
        const newHistory = cloneDeep(history);
        const newSteps = cloneDeep(steps);
        const newStep = newSteps[currentStep];
        const {terminal} = newStep;
        const newPixelState = this.transpose(terminal);
        const nextStep = steps.length;

        newHistory[nextStep] = [newPixelState];
        newSteps[nextStep] = cloneDeep(newStep);

        this.setState({
            ...this.state,
            currentStep: nextStep,
            steps: newSteps,
            history: newHistory,
            livePixels: newPixelState
        }, this.onMenuClose);
    };

    onAddClick = () => {
        const {currentStep, steps, history} = this.state;
        const newHistory = history.slice();
        const newPixelState = this.transpose(0);
        const newSteps = steps.slice();
        const nextStep = currentStep + 1;

        newHistory[nextStep] = [newPixelState];
        newSteps[nextStep] = {terminal: 0};

        this.setState({
            ...this.state,
            currentStep: nextStep,
            steps: newSteps,
            history: newHistory,
            livePixels: newPixelState
        }, this.onMenuClose);
    };

    onRemoveClick = () => {
        const {currentStep, steps, history} = this.state;
        const newHistory = history.slice();
        const newSteps = steps.slice();
        const nextStep = currentStep === 0 ? 0 : currentStep - 1;

        newHistory.splice(currentStep, 1);
        newSteps.splice(currentStep, 1);

        const terminal = get(newSteps, `${nextStep}.terminal`, 0);
        const livePixels = this.transpose(terminal);

        this.setState({
            ...this.state,
            currentStep: nextStep,
            steps: newSteps,
            history: newHistory,
            livePixels
        }, this.onMenuClose);
    };

    onFrameMenuClick = e => {
        const {currentTarget: anchorEl} = e;

        this.setState({anchorEl});
    };

    onMenuClose = () => {
        this.setState({anchorEl: null});
    };

    onNextClick = () => {
        // FIXME: Prevent out of bounds or wrap
        const {currentStep, steps} = this.state;
        const nextStep = currentStep + 1;
        const terminal = get(steps, `${currentStep}.terminal`, 0);
        const livePixels = this.transpose(terminal);

        this.setState({
            ...this.state,
            currentStep: nextStep,
            livePixels
        });
    };

    onPreviousClick = () => {
        // FIXME: Prevent out of bounds or wrap
        const {currentStep, steps} = this.state;
        const prevStep = currentStep - 1;
        const terminal = get(steps, `${prevStep}.terminal`, 0);
        const livePixels = this.transpose(terminal);

        this.setState({
            ...this.state,
            currentStep: prevStep,
            livePixels
        });
    };

    onTestFramesClick = () => {
        this.setState({frameTestOpen: true});
    };

    onTestFramesMenuClose = () => {
        this.setState({frameTestOpen: false});
    };

    onDirectionClick = direction => {
        const {currentStep, steps} = this.state;
        const newSteps = cloneDeep(steps);
        const activeStep = newSteps[currentStep];
        const {terminal} = activeStep;
        const feel = get(this.props, 'data.feel');
        const height = get(feel, 'panorama.height');
        const width = get(feel, 'panorama.width');

        let nextTerminal = terminal;

        switch (direction) {
            case 'up': {
                const terminalEnd = terminal + (width * 8);
                const possibleTerminal = terminal + width;

                if (terminalEnd < (height * width)) {
                    nextTerminal = possibleTerminal;
                }

                break;
            }
            case 'down': {
                const possibleTerminal = terminal - width;

                if (possibleTerminal >= 0) {
                    nextTerminal = possibleTerminal;
                }
                break;
            }
            case 'left': {
                const possibleTerminal = terminal + 1;
                const possibleEdge = possibleTerminal + 8;

                if (possibleEdge % width > 0) {
                    nextTerminal = possibleTerminal;
                }

                break;
            }
            case 'right': {
                const possibleTerminal = terminal - 1;

                if (terminal % width > 0) {
                    nextTerminal = possibleTerminal;
                }

                break;
            }
            case 'reset':
                nextTerminal = 0;

                break;
        }

        const livePixels = this.transpose(nextTerminal);

        activeStep.terminal = nextTerminal;

        this.setState({
            steps: newSteps,
            livePixels
        });
    };

    onUpClick = () => {
        this.onDirectionClick('up');
    };

    onDownClick = () => {
        this.onDirectionClick('down');
    };

    onLeftClick = () => {
        this.onDirectionClick('left');
    };

    onRightClick = () => {
        this.onDirectionClick('right');
    };

    onResetClick = () => {
        this.onDirectionClick('reset');
    };

    renderIcons() {
        const {steps = []} = this.state;

        return (
            <Fragment>
                <IconButton Icon={SettingsRemoteIcon} onClick={this.onTestClick} title="Test on default device" />
                {steps.length > 1 &&
                    <IconButton Icon={SettingsRemoteOutlinedIcon} onClick={this.onTestFramesClick} title="Test animation on default device" />
                }
                <IconButton Icon={SaveIcon} onClick={this.onEditClick} title="Save Feel" />
            </Fragment>
        );
    }

    render() {
        const {classes} = this.props;
        const nodes = Array(64).fill(true);
        const {anchorEl, currentStep, data, steps = [], frameTestOpen, livePixels, open, panoramaHeight, panoramaWidth, testDuration, testRepeat, testReverse, thumbIndex = 0} = this.state;
        const frameCount = steps.length || 1;
        const isNextActive = frameCount > (currentStep + 1);
        const isPrevActive = currentStep !== 0;
        const isDeleteActive = frameCount > 1;
        const isThumb = currentStep === thumbIndex;
        const feel = get(this.props, 'data.feel');
        const pixels = get(feel, 'panorama.pixels', []);
        const height = get(feel, 'panorama.height', 0);
        const width = get(feel, 'panorama.width', 0);
        const terminal = get(steps, `${currentStep}.terminal`, 0);
        const selectionBox = getSelectionBox(pixels, terminal, width);

        const extraContent = (
            <Fragment>
                <Toolbar className={classes.toolbar} variant="dense" disableGutters={true}>
                    <IconButton Icon={NavigateBeforeIcon} onClick={this.onPreviousClick} disabled={!isPrevActive} title="Go to previous frame" />
                    <IconButton Icon={NavigateNextIcon} onClick={this.onNextClick} disabled={!isNextActive} title="Go to next frame" />
                    <IconButton Icon={LibraryAddIcon} onClick={this.onFrameMenuClick} title="Add/Copy/Remove step" />
                    {steps.length > 1 &&
                        <IconButton Icon={PhotoAlbumIcon} color={isThumb ? 'secondary' : 'action'} onClick={this.onThumbClick} title="Make thumbnail" />
                    }
                    <Typography variant="button" className={classes.frameCount}>{currentStep + 1} / {frameCount}</Typography>
                </Toolbar>
            </Fragment>
        );

        return (
            <div className={classes.container}>
                <AppBar title="Edit Panorama" iconRenderer={this.renderIcons()} position="relative" />
                {extraContent}
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
                    <Form onChange={this.onDataChange} formData={data} frames={steps} />
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
                                    row={Math.floor(index / 8)} />
                            );
                        })}
                    </GridList>
                    <Toolbar className={classes.toolbar} variant="dense" disableGutters={true}>
                        <IconButton Icon={CenterFocusWeakIcon} onClick={this.onResetClick} title="Reset to beginning" />
                        <IconButton Icon={ArrowDropUpIcon} onClick={this.onUpClick} title="Move up" />
                        <IconButton Icon={ArrowRightIcon} onClick={this.onRightClick} title="Move right" />
                        <IconButton Icon={ArrowDropDownIcon} onClick={this.onDownClick} title="Move down" />
                        <IconButton Icon={ArrowLeftIcon} onClick={this.onLeftClick} title="Move left" />
                    </Toolbar>
                    <GridList className={classes.gridListPano} cols={width} id="panorama-preview">
                        {pixels.map((pixel, index) => {
                            const {color} = pixel;

                            return (
                                <Pixel
                                    key={index}
                                    index={index}
                                    color={color}
                                    row={Math.floor(index / width)}
                                    isPanorama={true}
                                    panoramaHeight={panoramaHeight}
                                    panoramaWidth={panoramaWidth}
                                    width={width}
                                    height={height}
                                    selectionBox={selectionBox} />
                            );
                        })}
                    </GridList>
                </div>
            </div>
        );
    }
}

export default withRouter(
    compose(
        graphql(editFeel, {name: 'editFeel'}),
        graphql(testFeel, {name: 'testFeel'}),
        withStyles(styles)
    )(Panorama)
);
