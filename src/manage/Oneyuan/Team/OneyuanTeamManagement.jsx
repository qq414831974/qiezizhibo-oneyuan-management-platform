import React from 'react';
import {Row, Col, Card, Button} from 'antd';
import BreadcrumbCustom from '../../Components/BreadcrumbCustom';
import {test} from '../../../axios/index';
import OneyuanTeamTable from "./OneyuanTeamTable";

class OneyuanTeamManagement extends React.Component {
    render() {
        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="比赛管理" second="队伍"/>
                <Row gutter={16}>
                    <Col className="gutter-row">
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <OneyuanTeamTable />
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default OneyuanTeamManagement;