import React from 'react';
import {Row, Col, Card, Button} from 'antd';
import BreadcrumbCustom from '../../Components/BreadcrumbCustom';
import OneyuanLeagueMatchTable from "./OneyuanLeagueMatchTable";
import {getQueryString} from "../../../utils";

class OneyuanLeagueMatchManagement extends React.Component {
    switchPage = (page) => {
        this.props.history.replace(`/oneyuan/oneyuanLeagueMatch?page=${page}`)
    }

    render() {
        const currentPage = getQueryString(this.props.location.search, "page");
        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="比赛管理" second="联赛"/>
                <Row gutter={16}>
                    <Col className="gutter-row">
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <OneyuanLeagueMatchTable
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

export default OneyuanLeagueMatchManagement;