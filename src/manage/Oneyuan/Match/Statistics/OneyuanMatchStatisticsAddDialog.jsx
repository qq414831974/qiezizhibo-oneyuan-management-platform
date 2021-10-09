import React from "react";
import {receiveData} from "../../../../action";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {Avatar, Button, Row, Col, Icon, Spin, Collapse, message, Input, Select, InputNumber} from 'antd';
import {getMatchPlayersByTeamId, addTimeline} from "../../../../axios";
import defultAvatar from '../../../../static/avatar.jpg';
import shirt from '../../../../static/shirt.png';
import shirt2 from '../../../../static/shirt2.png';
import flag from '../../../../static/flag.svg';
import ball from '../../../../static/ball.svg';
import ball2 from '../../../../static/ball2.svg';
import ball3 from '../../../../static/ball3.svg';
import vs from '../../../../static/vs.png';
import snatch from "../../../../static/snatch.svg";
import backboard from "../../../../static/backboard.svg";
import assists from "../../../../static/assists.svg";
const Option = Select.Option;
const Panel = Collapse.Panel;

const event = [
    {key: 6, text: "三分球", icon: ball3, show: 1},
    {key: 7, text: "二分球", icon: ball2, show: 1},
    {key: 8, text: "罚球", icon: ball, show: 1},
    {key: 9, text: "犯规", icon: flag, show: 1},
    {key: 16, text: "抢断", icon: snatch, show: 2},
    {key: 17, text: "篮板", icon: backboard, show: 2},
    {key: 18, text: "助攻", icon: assists, show: 2},
]

class OneyuanMatchScoreAddDialog extends React.Component {
    state = {
        current: 0,
        currentChecked: false,
        team: null,
        player: null,
        loading: true,
        hidden: true,
        scoreNumber: 1,
        playerList: [],
        playerLoading: true,
    };

    componentDidMount() {
        if (!this.props.visible) {
            return;
        }
        const {data} = this.props;
        if (data.againstTeams) {
            const againstMap = data.againstTeams;
            const size = Object.keys(againstMap).length;
            if (size > 1) {
                this.props.onHeightChange(270 + (size - 1) * 70);
            }
        }
    }

    fetchTeamPlayer = (teamId) => {
        this.setState({playerList: [], playerLoading: true})
        getMatchPlayersByTeamId(null, teamId).then((data) => {
            if (data && data.code == 200) {
                this.setState({playerList: data.data ? data.data.records : [], playerLoading: false})
            } else {
                message.error('获取比赛队伍队员失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
    }
    addTimeline = (param) => {
        addTimeline(param).then((data) => {
            if (data && data.code == 200) {
                if (data.data) {
                    message.success("添加成功", 1);
                    this.props.onSuccess();
                    this.props.onClose();
                } else {
                    message.warn(data.message, 1);
                }
            } else {
                message.error('修改失败：' + (data ? data.result + "-" + data.message + "-" + data.data : data), 3);
            }
        });
    }

    next() {
        const current = this.state.current + 1;
        let currentChecked = false;
        if (current == 0 && this.state.team != null) {
            currentChecked = true;
        }
        if (current == 1 && this.state.player != null) {
            currentChecked = true;
        }
        if (current == 2 && this.state.event != null) {
            currentChecked = true;
        }
        this.setState({current: current, currentChecked: currentChecked});
        if (current == 1) {
            this.props.onHeightChange(380);
        } else if (current == 2) {
            let hidden = this.state.hidden;
            if (this.state.event) {
                if (this.state.event.show == 2) {
                    this.setState({hidden: false});
                    hidden = false;
                }
            }
            if (hidden) {
                this.props.onHeightChange(270);
            } else {
                this.props.onHeightChange(420);
            }
        } else if (current == 3) {
            this.props.onHeightChange(350);
        } else {
            this.props.onHeightChange(270);
        }
    }

    prev() {
        const current = this.state.current - 1;
        let currentChecked = false;
        if (current == 0 && this.state.team != null) {
            currentChecked = true;
        }
        if (current == 1 && this.state.player != null) {
            currentChecked = true;
        }
        if (current == 2 && this.state.event != null) {
            currentChecked = true;
        }
        this.setState({current: current, currentChecked: currentChecked});
        if (current == 1) {
            this.props.onHeightChange(380);
        } else if (current == 2) {
            let hidden = this.state.hidden;
            if (this.state.event) {
                if (this.state.event.show == 2) {
                    this.setState({hidden: false});
                    hidden = false;
                }
            }
            if (hidden) {
                this.props.onHeightChange(270);
            } else {
                this.props.onHeightChange(420);
            }
        } else if (current == 3) {
            this.props.onHeightChange(350);
        } else {
            this.props.onHeightChange(270);
        }
    }

    onTeamSelect = (againstIndex, teamId, e) => {
        let currentTeam = null;
        this.props.data.againstTeams && Object.keys(this.props.data.againstTeams).forEach(key => {
            const againstTeam = this.props.data.againstTeams[key]
            if (againstTeam && againstTeam.hostTeam && againstTeam.hostTeam.id == teamId) {
                currentTeam = againstTeam.hostTeam;
            } else if (againstTeam && againstTeam.guestTeam && againstTeam.guestTeam.id == teamId) {
                currentTeam = againstTeam.guestTeam;
            }
        })
        this.setState({team: currentTeam, againstIndex: againstIndex, currentChecked: true});
        this.fetchTeamPlayer(currentTeam.id)
        this.next();
    }
    onPlayerSelect = (player, e) => {
        this.setState({player: player, currentChecked: true});
        this.next();
    }
    getTeamPlayerList = () => {
        let doms = [];
        let teamPlayerData = null;
        const shirtStyle = {position: "absolute", fontSize: 12, color: "#FFFFFF",};
        const shirtStyle2 = {position: "absolute", fontSize: 12, color: "#000000",};
        const onPlayerSelect = this.onPlayerSelect;
        if (this.state.team) {
            teamPlayerData = this.state.playerList;
            teamPlayerData.forEach((item, index) => {
                // if (item.status) {//1：首发，2：替补，3：队员
                let dom_div = (
                    <Col span={(Math.floor(24 / (teamPlayerData.length > 6 ? 6 : teamPlayerData.length)))}>
                        <div onClick={onPlayerSelect.bind(this, item)}
                             className={this.state.player == item ? "step-item-hover step-item-selected center" : "step-item-hover center"}>
                            <div style={{width: "58px", position: "relative"}}>
                                <div className="center" style={{position: "absolute", right: 0}}>
                                    <img
                                        style={{opacity: 0.8, width: "20px", height: "20px"}}
                                        src={item.status == 1 ? shirt : shirt2}/>
                                    <p style={item.status == 1 ? shirtStyle : shirtStyle2}>{item.shirtNum}</p>
                                </div>
                                <img className="round-img-s" src={item.headImg ? item.headImg : defultAvatar}/>
                                <p className="mb-n">{item.name}</p>
                            </div>
                        </div>
                    </Col>);
                let row = Math.floor(index / 6);
                if (!doms[row]) {
                    doms[row] = [];
                }
                doms[row].push(dom_div)
                // }
            });
        }
        let dom = [];
        doms.forEach((item, index) => {
            dom.push(<Row className="center" gutter={2}>{item}</Row>)
        });
        return <div>
            <p className="w-full mb-n"
               style={{fontSize: 20}}>选择队员</p>
            {this.state.playerLoading ? <Spin/> : null}
            {dom}
        </div>;
    }
    getEventList = () => {
        let doms = [];
        let doms_hidden = [];
        const onEventSelect = this.onEventSelect;
        const onHiddenChange = this.onHiddenChange;
        const rowSize = 4;
        let indes = 0;
        let index_hidden = 0;
        event.forEach((item, index) => {
            if (item.show == 1) {
                let row = Math.floor(indes / rowSize);
                let dom_div = (<Col span={Math.floor(24 / rowSize)}>
                    <div onClick={onEventSelect.bind(this, item)}
                         className={this.state.event == item ? "step-item-hover step-item-selected center" : "step-item-hover center"}>
                        <div style={{width: "78px", position: "relative"}}>
                            <img className="round-img-m" src={item.icon ? item.icon : defultAvatar}/>
                            <p className="mb-n">{item.text}</p>
                        </div>
                    </div>
                </Col>);
                if (!doms[row]) {
                    doms[row] = [];
                }
                doms[row].push(dom_div)
                indes = indes + 1;
            } else if (item.show == 2) {
                let row = Math.floor(index_hidden / rowSize);
                let dom_div = (<Col span={Math.floor(24 / rowSize)}>
                    <div onClick={onEventSelect.bind(this, item)}
                         className={this.state.event == item ? "step-item-hover step-item-selected center" : "step-item-hover center"}>
                        <div style={{width: "78px", position: "relative"}}>
                            <img className="round-img-m" src={item.icon ? item.icon : defultAvatar}/>
                            <p className="mb-n">{item.text}</p>
                        </div>
                    </div>
                </Col>);
                if (!doms_hidden[row]) {
                    doms_hidden[row] = [];
                }
                doms_hidden[row].push(dom_div)
                index_hidden = index_hidden + 1;
            }
        });
        let dom = [];
        doms.forEach((item, index) => {
            dom.push(<Row className="center" gutter={2}>{item}</Row>)
        });
        let dom_hidden = [];
        doms_hidden.forEach((item, index) => {
            dom_hidden.push(<Row hidden={this.state.hidden} className="center" gutter={2}>{item}</Row>)
        });
        return <div>
            <p className="w-full mb-n"
               style={{fontSize: 20}}>选择事件</p>
            {dom}
            <Collapse activeKey={this.state.hidden ? null : "1"} onChange={onHiddenChange} bordered={false}
                      className="step-collapse-no-border">
                <Panel header={
                    <div className="w-full center" style={{paddingRight: "40px"}}>
                        <Icon type={this.state.hidden ? "down" : "up"} style={{fontSize: 15}}/>
                    </div>
                }
                       forceRender
                       key="1">
                    {dom_hidden}
                </Panel>
            </Collapse>
        </div>;
    }
    onEventSelect = (item, e) => {
        this.setState({event: item, currentChecked: true});
        this.next();
    }
    onHiddenChange = (e) => {
        if (e.length != 0) {
            this.setState({hidden: false});
            this.props.onHeightChange(420);
        } else {
            this.setState({hidden: true});
            this.props.onHeightChange(270);
        }
    }
    submit = () => {
        const params = {
            matchId: this.props.data.id,
            teamId: this.state.team.id,
            playerId: this.state.player.id,
            eventType: this.state.event.key,
            againstIndex: this.state.againstIndex,
            section: this.state.section ? this.state.section : this.props.section,
        }
        this.addTimeline(params);
    }
    getEventDetail = () => {
        const currentEvent = this.state.event;
        if (currentEvent == null) {
            return null;
        }
        let dom = [];
        if (this.props.data && this.props.data.section) {
            for (let i = 0; i < this.props.data.section; i++) {
                dom.push(<Option value={i + 1}>{`第${i + 1}小节`}</Option>)
            }
        }

        const currentSection = this.state.section ? this.state.section : this.props.section;
        return <div>
            <div>
                <Avatar src={currentEvent.icon}/>
            </div>
            <div className="w-full">
                <span style={{fontSize: 14}}>{currentEvent.text}</span>
            </div>
            <div className="w-full centher mt-m">
                选择小节数
            </div>
            <div className="pt-s">
                <Select style={{minWidth: 200}} onChange={this.onSectionChange} value={currentSection}
                        placeholder="选择小节数">
                    {dom}
                </Select>
            </div>
        </div>
    }
    onSectionChange = (e) => {
        this.setState({section: e})
    }
    getTeamList = () => {
        const {data, againstIndex} = this.props;
        let dom = [];
        if (data.againstTeams) {
            const againstMap = data.againstTeams;
            Object.keys(againstMap).forEach(key => {
                const hostTeam = againstMap[key].hostTeam;
                const guestTeam = againstMap[key].guestTeam;
                dom.push(
                    <Row key={`against-${key}`}
                         className={`mt-s border-radius-10px border-gray ${againstIndex != null && key == againstIndex ? "cell-highlight" : ""}`}>
                        <Col span={10}>
                            <div
                                className={this.state.team && (hostTeam.id == this.state.team.id) ? "step-item-hover step-item-selected" : "step-item-hover"}
                                onClick={this.onTeamSelect.bind(this, key, hostTeam.id)}>
                                <div className="w-full center">
                                    <img className="round-img-s mt-s"
                                         src={hostTeam.headImg ? hostTeam.headImg : defultAvatar}/>
                                </div>
                                <div className="w-full center">
                                    <span style={{fontSize: 16}} className="w-full">
                                        {hostTeam.name}
                                    </span>
                                </div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="w-full center">
                                <span>对阵{key}</span>
                            </div>
                            <div className="center w-full">
                                <img style={{height: 45, width: 90}} src={vs}/>
                            </div>
                        </Col>
                        <Col span={10}>
                            <div
                                className={this.state.team && (guestTeam.id == this.state.team.id) ? "step-item-hover step-item-selected" : "step-item-hover"}
                                onClick={this.onTeamSelect.bind(this, key, guestTeam.id)}>
                                <div className="w-full center">
                                    <img className="round-img-s mt-s"
                                         src={guestTeam.headImg ? guestTeam.headImg : defultAvatar}/>
                                </div>
                                <div className="w-full center">
                                    <span style={{fontSize: 16}} className="w-full">
                                        {guestTeam.name}
                                    </span>
                                </div>
                            </div>
                        </Col>
                    </Row>);
            })
        }
        return <div>
            <span className="w-full mb-n" style={{fontSize: 20}}>选择队伍</span>
            {dom}
        </div>
    }

    render() {
        const {data} = this.props;
        const {current, currentChecked} = this.state;
        const getTeamList = this.getTeamList;
        const getTeamPlayerList = this.getTeamPlayerList;
        const getEventList = this.getEventList;
        const getEventDetail = this.getEventDetail;
        const steps = [{
            content: getTeamList(),
        }, {
            content: getTeamPlayerList(),
        }, {
            content: getEventList(),
        }, {
            content: getEventDetail(),
        }];
        return <div className="steps-div">
            <div className="steps-content h-full">{steps[current].content}</div>
            <div className="steps-action center">
                {
                    current > 0
                    && (
                        <Button icon="arrow-left" size="large" shape="circle"
                                onClick={() => this.prev()}/>
                    )
                }
                {
                    current < steps.length - 1
                    &&
                    <Button disabled={!currentChecked} type="primary" icon="arrow-right" size="large" shape="circle"
                            className={current == 0 ? "" : "ml-m"}
                            onClick={() => this.next()}/>
                }
                {
                    current === steps.length - 1
                    && <Button type="primary" icon="check" size="large" shape="circle"
                               className="ml-m" onClick={() => {
                        this.submit();
                    }}/>
                }
            </div>
        </div>;
    }
}

const mapStateToProps = state => {
    const {auth = {data: {}}, responsive = {data: {}}} = state.httpData;
    return {auth, responsive};
};
const mapDispatchToProps = dispatch => ({
    receiveData: bindActionCreators(receiveData, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(OneyuanMatchScoreAddDialog);