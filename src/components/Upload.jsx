import React from 'react';

import AppBar from '-/components/AppBar';

class Upload extends React.Component {
    render() {
        return (
            <div>
                <AppBar title="Upload" />
                <form action="https://feelsbox-server.herokuapp.com/upload" method="POST" encType="multipart/form-data" target="_blank">
                    <div className="row">
                        <div className="form-group">
                            <label>Name:</label>
                            <input type="text" name="emoji" className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Category:</label>
                            <select name="category" className="form-control">
                                <option value="misc">Miscellaneous</option>
                                <option value="food">Food</option>
                                <option value="drink">Drinks</option>
                                <option value="holiday">Holiday</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>File:</label>
                            <input type="file" name="png" className="form-control" />
                        </div>
                    </div>
                    <input type="submit" href="#" className="btn btn-primary" value="Upload" />
                </form>
            </div>
        );
    }
}

export default Upload;