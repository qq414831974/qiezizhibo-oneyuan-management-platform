import React from 'react';
import {Row, Col, Card, Button, Tabs, message, Form, Tooltip, Avatar} from 'antd';
import BreadcrumbCustom from '../../../Components/BreadcrumbCustom';
import {bindActionCreators} from "redux";
import {receiveData} from "../../../../action";
import {connect} from "react-redux";
import {getQueryString} from "../../../../utils";
import {
    getLeagueChargeRule,
    addLeagueChargeRule,
    updateLeagueChargeRule,
    leagueChargeAllMatch,
    getLeagueMatchById,
    getLeagueMemberRule,
    addLeagueMemberRule,
    updateLeagueMemberRule,
} from "../../../../axios";
import LeagueChargeForm from "./LeagueChargeForm";
import OneyuanLeagueMatchBillAnalysis from "../../League/Bill/OneyuanLeagueMatchBillAnalysis";
import defultAvatar from "../../../../static/avatar.jpg";
import NP from 'number-precision'
import LeagueMemberForm from "./LeagueMemberForm";
import UserLeagueMemberTable from "./UserLeagueMemberTable";

const TabPane = Tabs.TabPane;

class OneyuanLeagueChargeManagement extends React.Component {
    state = {
        data: {},
        memberData: {},
        leagueData: {},
    }

    componentDidMount() {
        this.refresh();
    }

    refresh = () => {
        const currentLeague = getQueryString(this.props.location.search, "leagueId");
        this.fetch({leagueId: currentLeague})
        if (this.props.location.search) {
            let currentTab = getQueryString(this.props.location.search, "tab");
            if (currentTab == null) {
                currentTab = 1;
            }
            this.setState({currentTab: currentTab.toString()});
        }
    }
    fetch = (params = {}) => {
        this.setState({loading: true, memberLoading: true})
        getLeagueChargeRule(params).then((data) => {
            this.setState({loading: false})
            if (data && data.code == 200) {
                this.setState({
                    data: data.data ? data.data : {},
                });
            } else {
                message.error('获取联赛充值规则失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
        getLeagueMemberRule(params).then((data) => {
            this.setState({memberLoading: false})
            if (data && data.code == 200) {
                this.setState({
                    memberData: data.data ? data.data : {},
                });
            } else {
                message.error('获取联赛会员规则失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
        getLeagueMatchById(params.leagueId).then(data => {
            if (data && data.code == 200) {
                this.setState({
                    leagueData: data.data ? data.data : {},
                });
            } else {
                message.error('获取联赛信息失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        })
    }

    saveChargeSettingRef = (form) => {
        this.form = form;
    }
    saveMemberSettingRef = (form) => {
        this.form_member = form;
    }
    chargeAll = () => {
        const currentLeague = getQueryString(this.props.location.search, "leagueId");
        this.setState({chargeAllLoading: true})
        leagueChargeAllMatch({leagueId: currentLeague}).then(data => {
            if (data && data.code == 200) {
                if (data.data) {
                    message.success('修改成功', 1);
                    this.refresh();
                } else {
                    message.warn(data.message, 1);
                }
                this.setState({chargeAllLoading: false})
            } else {
                message.error('修改失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        })
    }
    handleChargeSettingSubmit = (e) => {
        const currentLeague = getQueryString(this.props.location.search, "leagueId");
        e.preventDefault();
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            values.leagueId = currentLeague;
            if (values.record) {
                values.record.price = NP.times(values.record.price, 100)
                values.record.priceMonthly = NP.times(values.record.priceMonthly, 100)
                if (values.record.giftWatchPrice) {
                    values.record.giftWatchPrice = NP.times(values.record.giftWatchPrice, 100)
                }
                if (values.record.giftWatchPriceMonthly) {
                    values.record.giftWatchPriceMonthly = NP.times(values.record.giftWatchPriceMonthly, 100)
                }
            }
            if (values.live) {
                if (values.live.price) {
                values.live.price = NP.times(values.live.price, 100)
                }
                if (values.live.priceMonthly) {
                values.live.priceMonthly = NP.times(values.live.priceMonthly, 100)
            }
                if (values.live.giftWatchEnable) {
                    values.live.giftWatchPrice = 0
                    values.live.giftWatchPriceMonthly = 0
                }
            }
            if (values.monopoly) {
                values.monopoly.price = NP.times(values.monopoly.price, 100)
            }
            this.setState({modifyLoading: true})
            if (this.state.data && this.state.data.id) {
                updateLeagueChargeRule(values).then(data => {
                    this.setState({modifyLoading: false})
                    if (data && data.code == 200) {
                        if (data.data) {
                            message.success('修改成功', 1);
                            this.refresh();
                        } else {
                            message.warn(data.message, 1);
                        }
                    } else {
                        message.error('修改失败：' + (data ? data.result + "-" + data.message : data), 3);
                    }
                })
            } else {
                addLeagueChargeRule(values).then(data => {
                    this.setState({modifyLoading: false})
                    if (data && data.code == 200) {
                        if (data.data) {
                            message.success('修改成功', 1);
                            this.refresh();
                        } else {
                            message.warn(data.message, 1);
                        }
                    } else {
                        message.error('添加失败：' + (data ? data.result + "-" + data.message : data), 3);
                    }
                })
            }
        });
    }
    handleMemberSettingSubmit = (e) => {
        const currentLeague = getQueryString(this.props.location.search, "leagueId");
        e.preventDefault();
        const form = this.form_member;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            values.leagueId = currentLeague;
            if (values.price) {
                values.price = NP.times(values.price, 100)
            }
            this.setState({modifyMemberLoading: true})
            if (this.state.memberData && this.state.memberData.id) {
                updateLeagueMemberRule(values).then(data => {
                    this.setState({modifyMemberLoading: false})
                    if (data && data.code == 200) {
                        if (data.data) {
                            message.success('修改成功', 1);
                            this.refresh();
                        } else {
                            message.warn(data.message, 1);
                        }
                    } else {
                        message.error('修改失败：' + (data ? data.result + "-" + data.message : data), 3);
                    }
                })
            } else {
                addLeagueMemberRule(values).then(data => {
                    this.setState({modifyMemberLoading: false})
                    if (data && data.code == 200) {
                        if (data.data) {
                            message.success('修改成功', 1);
                            this.refresh();
                        } else {
                            message.warn(data.message, 1);
                        }
                    } else {
                        message.error('添加失败：' + (data ? data.result + "-" + data.message : data), 3);
                    }
                })
            }
        });
    }

    render() {
        const currentLeague = getQueryString(this.props.location.search, "leagueId");
        const ChargeSetting = Form.create()(LeagueChargeForm);
        const MemberSetting = Form.create()(LeagueMemberForm);

        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="充值" second="联赛"/>
                <Row gutter={16}>
                    <Col className="gutter-row">
                        <div className="gutter-box">
                            <Card className={this.props.responsive.data.isMobile ? "no-padding" : ""}
                                  bordered={false}
                                  title={<div className="center purple-light pt-s pb-s pl-m pr-m border-radius-10px">
                                      <Avatar
                                          src={this.state.leagueData.headImg ? this.state.leagueData.headImg : defultAvatar}/>
                                      <span className="ml-s">{this.state.leagueData.name}</span>
                                  </div>}>
                                <Tabs activeKey={this.state.currentTab} onChange={(value) => {
                                    this.setState({currentTab: value});
                                    this.props.history.replace(`/oneyuan/league/charge?leagueId=${currentLeague}&tab=${value}`)
                                }}>
                                    <TabPane tab="充值设置" key="1">
                                        <div style={{minHeight: 32, marginBottom: 10}}>
                                            <Tooltip title="刷新">
                                                <Button type="primary" shape="circle" icon="reload"
                                                        className="pull-right"
                                                        loading={this.state.loading || this.state.memberLoading}
                                                        onClick={this.refresh}/>
                                            </Tooltip>
                                        </div>
                                        <ChargeSetting
                                            visible={true}
                                            record={this.state.data}
                                            handleSubmit={this.handleChargeSettingSubmit}
                                            chargeAll={this.chargeAll}
                                            chargeAllLoading={this.state.chargeAllLoading}
                                            modifyLoading={this.state.modifyLoading}
                                            ref={this.saveChargeSettingRef}/>
                                        <MemberSetting
                                            visible={true}
                                            record={this.state.memberData}
                                            handleSubmit={this.handleMemberSettingSubmit}
                                            modifyLoading={this.state.modifyMemberLoading}
                                            ref={this.saveMemberSettingRef}/>
                                    </TabPane>
                                    <TabPane tab="收益查看" key="2">
                                        <OneyuanLeagueMatchBillAnalysis leagueId={currentLeague}/>
                                    </TabPane>
                                    <TabPane tab="联赛会员查看" key="3">
                                        <UserLeagueMemberTable leagueId={currentLeague}/>
                                    </TabPane>
                                </Tabs>
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

export default connect(mapStateToProps, mapDispatchToProps)(OneyuanLeagueChargeManagement);