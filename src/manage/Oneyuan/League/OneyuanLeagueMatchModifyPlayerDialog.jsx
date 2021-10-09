import React from 'react';
import {
    Form,
    Input,
    Select,
    Avatar,
    Tooltip,
    InputNumber,
} from 'antd';
import moment from 'moment'
import 'moment/locale/zh-cn';
import {receiveData} from "../../../action";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import avatar from '../../../static/avatar.jpg';
import {getTeamInLeague, getPlayersByTeamId} from "../../../axios";
import {message} from "antd/lib/index";

moment.locale('zh-cn');

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 4},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 16},
    },
};

class OneyuanLeagueMatchModifyPlayerDialog extends React.Component {
    state = {data: [], playerdata: [], playerSelectDisable: true}

    componentDidMount() {
        this.fetchTeam();
        this.setState({currentTeam: this.props.record.teamId});
    }

    fetchTeam = () => {
        this.setState({
            loading: true,
        });
        this.props.record && getTeamInLeague(this.props.record.leagueId).then((data) => {
            if (data && data.code == 200) {
                this.setState({
                    data: data.data.records,
                    loading: false,
                    playerSelectDisable: false,
                });
                this.fetchPlayer();
            } else {
                message.error('获取队伍列表失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
    }
    fetchPlayer = () => {
        this.setState({
            playerloading: true,
        });
        this.state.currentTeam && getPlayersByTeamId(this.state.currentTeam, {
            pageSize: 100,
            pageNum: 1,
        }).then((data) => {
            if (data && data.code == 200) {
                this.setState({
                    playerdata: data.data ? data.data.records : "",
                    playerloading: false,
                });
            } else {
                message.error('获取队员列表失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
    }
    onTeamChange = (e) => {
        this.setState({currentTeam: e, playerSelectDisable: false});
        this.props.form.setFieldsValue({playerId: null})
    }
    onPlayerFocus = () => {
        this.fetchPlayer();
    }

    render() {
        const {visible, form} = this.props;

        const {getFieldDecorator} = form;
        const options = this.state.data.map(d => <Option style={{height: 50}} key={d.id} value={d.id}>
            <Tooltip title={d.remark}>
                <div>
                    <Avatar src={d.headImg}/>
                    <span className="ml-s">{d.name}</span>
                </div>
            </Tooltip>
        </Option>);
        const options_player = this.state.playerdata.map(d => <Option style={{height: 50}} key={d.id} value={d.id}>
            <Tooltip title={d.remark}>
                <div>
                    <Avatar src={d.headImg}/>
                    <span className="ml-s">{`${d.name}(${d.shirtNum}号)`}</span>
                </div>
            </Tooltip>
        </Option>);
        return (
            visible ?
                <div>
                    <Form>
                        <FormItem {...formItemLayout} label="队伍" className="bs-form-item">
                            {getFieldDecorator('teamId', {
                                rules: [{required: true, message: '请选择!'}],
                                initialValue: this.props.record.teamId
                            })(
                                <Select
                                    showSearch
                                    style={{minWidth: 300}}
                                    placeholder="选择队伍"
                                    defaultActiveFirstOption={false}
                                    showArrow={false}
                                    notFoundContent={null}
                                    loading={this.state.loading}
                                    onChange={this.onTeamChange}
                                >
                                    {options}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="队员" className="bs-form-item">
                            {getFieldDecorator('playerId', {
                                rules: [{required: true, message: '请选择!'}],
                                initialValue: this.props.record.playerId
                            })(
                                <Select
                                    showSearch
                                    style={{minWidth: 300}}
                                    placeholder="选择队员"
                                    defaultActiveFirstOption={false}
                                    showArrow={false}
                                    notFoundContent={null}
                                    loading={this.state.playerloading}
                                    disabled={this.state.playerSelectDisable}
                                    onFocus={this.onPlayerFocus}
                                >
                                    {options_player}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="三分" className="bs-form-item">
                            {getFieldDecorator('threePoint', {
                                initialValue: this.props.record.threePoint
                            })(
                                <InputNumber placeholder="三分"/>
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="两分" className="bs-form-item">
                            {getFieldDecorator('twoPoint', {
                                initialValue: this.props.record.twoPoint
                            })(
                                <InputNumber placeholder="两分"/>
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="罚球" className="bs-form-item">
                            {getFieldDecorator('onePoint', {
                                initialValue: this.props.record.onePoint
                            })(
                                <InputNumber placeholder="罚球"/>
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="犯规" className="bs-form-item">
                            {getFieldDecorator('foul', {
                                initialValue: this.props.record.foul
                            })(
                                <InputNumber placeholder="犯规"/>
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="抢断" className="bs-form-item">
                            {getFieldDecorator('snatch', {
                                initialValue: this.props.record.snatch
                            })(
                                <InputNumber placeholder="抢断"/>
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="篮板" className="bs-form-item">
                            {getFieldDecorator('backboard', {
                                initialValue: this.props.record.backboard
                            })(
                                <InputNumber placeholder="篮板"/>
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="助攻" className="bs-form-item">
                            {getFieldDecorator('assists', {
                                initialValue: this.props.record.assists
                            })(
                                <InputNumber placeholder="助攻"/>
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="总场次" className="bs-form-item">
                            {getFieldDecorator('totalMatch', {
                                initialValue: this.props.record.totalMatch
                            })(
                                <InputNumber placeholder="助攻"/>
                            )}
                        </FormItem>
                        <FormItem style={{margin: 0}}>
                            {getFieldDecorator('leagueId', {
                                initialValue: this.props.record.leagueId,
                            })(
                                <Input hidden={true}/>
                            )}
                        </FormItem>
                        <FormItem style={{margin: 0}}>
                            {getFieldDecorator('id', {
                                initialValue: this.props.record.id,
                            })(
                                <Input hidden={true}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
                :
                <div/>
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

export default connect(mapStateToProps, mapDispatchToProps)(OneyuanLeagueMatchModifyPlayerDialog);