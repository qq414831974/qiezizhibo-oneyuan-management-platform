import React from 'react';
import {Row, Col, Card} from 'antd';
import BreadcrumbCustom from '../../Components/BreadcrumbCustom';
import {test} from '../../../axios/index';
import OneyuanPlayerTable from "./OneyuanPlayerTable";
import {bindActionCreators} from "redux";
import {receiveData} from "../../../action";
import {connect} from "react-redux";

class OneyuanPlayerManagement extends React.Component {
    render() {
        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="比赛管理" second="队员"/>
                <Row gutter={16}>
                    <Col className="gutter-row">
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <OneyuanPlayerTable />
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}
const mapStateToProps = state => {
    const {auth = {data: {}}, responsive = {data: {}}} = state.httpData;
    return {auth, responsive};
};
const mapDispatchToProps = dispatch => ({
    receiveData: bindActionCreators(receiveData, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(OneyuanPlayerManagement);