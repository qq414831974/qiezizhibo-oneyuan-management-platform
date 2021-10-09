import React from 'react';
import {Row, Col, Card, Button} from 'antd';
import BreadcrumbCustom from '../../Components/BreadcrumbCustom';
import OneyuanMatchTable from "./OneyuanMatchTable";
import {bindActionCreators} from "redux";
import {receiveData} from "../../../action";
import {connect} from "react-redux";
import {getQueryString} from "../../../utils";

class OneyuanMatchManagement extends React.Component {
    switchPage = (page) => {
        const currentLeague = getQueryString(this.props.location.search, "leagueId");
        if(currentLeague!=null){
            this.props.history.replace(`/oneyuan/oneyuanMatch?leagueId=${currentLeague}&page=${page}`)
        }else{
            this.props.history.replace(`/oneyuan/oneyuanMatch?page=${page}`)
        }
    }
    render() {
        const currentLeague = getQueryString(this.props.location.search, "leagueId");
        const currentPage = getQueryString(this.props.location.search, "page");
        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="比赛管理" second="比赛"/>
                <Row gutter={16}>
                    <Col className="gutter-row">
                        <div className="gutter-box">
                            <Card className={this.props.responsive.data.isMobile ? "no-padding" : ""} bordered={false}>
                                <OneyuanMatchTable
                                    leagueId={currentLeague}
                                    page={currentPage}
                                    switchPage={this.switchPage}/>
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
    console.log(state)

    return {auth, responsive};
};
const mapDispatchToProps = dispatch => ({
    receiveData: bindActionCreators(receiveData, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(OneyuanMatchManagement);