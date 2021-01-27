import {Component} from 'react';
import {graphql} from 'react-apollo';
import {compose} from 'recompose';
import {withRouter} from 'react-router-dom';
import {get} from 'lodash';

import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ListAltIcon from '@material-ui/icons/ListAlt';

import {getMyCategories} from '-/graphql/category';

class CategoriesSelect extends Component {
    constructor(props) {
        super(props);

        this.state = {
            categories: []
        };
    }

    onCategoriesChange = e => {
        const categories = get(e, 'target.value');
        const {categorySelectionHandler} = this.props;

        this.setState({categories}, () => {
            if (typeof categorySelectionHandler === 'function') {
                categorySelectionHandler(categories);
            }
        });
    };

    render() {
        const {categories: filter = []} = this.state;
        const myCategories = get(this.props, 'data_categories.myCategories') || [];
        const adornment = (
            <InputAdornment position="start">
                <ListAltIcon />
            </InputAdornment>
        );

        return (
            <Select
                value={filter}
                onChange={this.onCategoriesChange}
                startAdornment={adornment}
                multiple={true}
                autoWidth={false}
                style={{width: '50%'}}
                margin="dense"
                size="small"
                variant="outlined">
                {myCategories.map(category => {
                    const {_id, name} = category;

                    return (
                        <MenuItem key={_id} value={_id}>{name}</MenuItem>
                    );
                })}
            </Select>
        );
    }
}

export default withRouter(
    compose(
        graphql(getMyCategories, {
            name: 'data_categories',
            options: {
                notifyOnNetworkStatusChange: true
            }
        })
    )(CategoriesSelect)
);
