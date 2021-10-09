import React from "react";
import {receiveData} from "../../../../action";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {Avatar, Button, message, Input, DatePicker, Select} from 'antd';
import {addTimeline} from "../../../../axios";
import defultAvatar from "../../../../static/avatar.jpg";

const Option = Select.Option;

class OneyuanMatchScoreTimeEventAddDialog extends React.Component {
    state = {
        current: 0,
        currentChecked: false,
        loading: true,
        hidden: true,
    };

    componentDidMount() {
        if (!this.props.visible) {
            return;
        }
        this.setState({statusDialogAgainstIndex: this.props.againstIndex})
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
                message.error('添加失败：' + (data ? data.result + "-" + data.message + "-" + data.data : data), 3);
            }
        });
    }

    submit = () => {
        let againstIndex = null;
        if(this.props.event.key == 4 || this.props.event.key == 14){
            againstIndex = this.props.againstIndex;
        }else if(this.props.event.key == 5){
            againstIndex = this.state.statusDialogAgainstIndex;
        }
        const params = {
            matchId: this.props.data.id,
            eventType: this.props.event.key,
            againstIndex: againstIndex,
        }
        this.addTimeline(params);
    }
    onStatusDialogAgainstIndexChange = (e) => {
        this.setState({statusDialogAgainstIndex: e});
    }
    getEventDetail = () => {
        const currentEvent = this.props.event;
        if (currentEvent == null) {
            return null;
        }
        let againstOptionDom = [];
        if (currentEvent.key == 5 && this.props.data != null) {
            const againstMap = this.props.data.againstTeams;
            if (againstMap != null) {
                Object.keys(againstMap).forEach(key => {
                    const hostTeam = againstMap[key].hostTeam;
                    const guestTeam = againstMap[key].guestTeam;
                    againstOptionDom.push(<Option key={`againstOption-${key}`} value={Number(key)}>
                        <div className="w-full center">
                            <span>{`对阵${key}：`}</span>
                            <span>{hostTeam.name}</span>
                            <img src={hostTeam.headImg ? hostTeam.headImg : defultAvatar} className="round-img-s"/>
                            <span>vs</span>
                            <img src={guestTeam.headImg ? guestTeam.headImg : defultAvatar} className="round-img-s"/>
                            <span>{guestTeam.name}</span>
                        </div>
                    </Option>)
                });
            }
        }
        return <div>
            <div>
                <img className="round-img" src={currentEvent.icon}/>
            </div>
            <div className="w-full mt-s">
                <span style={{fontSize: 16}}>{currentEvent.text}</span>
            </div>
            {currentEvent.key == 5 ? <div className="w-full center pt-s">
                <Select style={{minWidth: 300}}
                        onChange={this.onStatusDialogAgainstIndexChange}
                        value={this.state.statusDialogAgainstIndex}
                        placeholder="选择当前对阵方">
                    {againstOptionDom}
                </Select>
            </div> : null}
        </div>
    }

    render() {
        const {data} = this.props;
        const getEventDetail = this.getEventDetail;
        return <div className="steps-div">
            <div
                className="steps-content-large">{getEventDetail()}</div>
            <div className="steps-action center">
                <Button type="primary" icon="check" size="large" shape="circle" onClick={() => {
                    this.submit();
                }}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(OneyuanMatchScoreTimeEventAddDialog);