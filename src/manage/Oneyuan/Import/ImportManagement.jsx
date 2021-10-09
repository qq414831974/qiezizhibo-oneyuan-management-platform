import React from 'react';
import {Row, Col, Card, Button} from 'antd';
import BreadcrumbCustom from '../../Components/BreadcrumbCustom';
import {Link} from "react-router-dom";

class ImportManagement extends React.Component {

    render() {
        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="比赛管理" second="导入"/>
                <Row gutter={16}>
                    <Col className="gutter-row">
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <Button type="primary">
                                    <Link to={
                                        `/oneyuan/import`
                                    }>暂无</Link
                                    ></Button>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ImportManagement;