import React from 'react';
import {
    Form,
    Input,
    Select,
    Upload,
    Tooltip,
    InputNumber,
    Icon,
    Button,
    Row,
    Col,
    Collapse, Progress, Switch, message, Radio
} from 'antd';
import moment from 'moment'
import 'moment/locale/zh-cn';
import {receiveData} from "../../../../action";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";


const Option = Select.Option;
const {Panel} = Collapse;

moment.locale('zh-cn');

const FormItem = Form.Item;

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

class LeagueClipForm extends React.Component {
    state = {
    }

    componentDidMount() {
    }

    render() {
        const {visible, form, record} = this.props;
        const {getFieldDecorator} = form;

        return (
            visible ?
                <Form onSubmit={this.props.handleSubmit}>
                    <FormItem {...formItemLayout} label="开启" className="bs-form-item">
                        {getFieldDecorator('available', {
                            initialValue: record.available,
                            valuePropName: 'checked',
                            rules: [{required: true, message: '请选择是否开启!'}],
                        })(
                            <Switch/>
                        )}
                    </FormItem>
                    <div className="danger center">
                        每天晚上11点自动生成当天比赛集锦
                    </div>
                    {record.id ? <FormItem {...formItemLayout} hidden className="bs-form-item">
                        {getFieldDecorator('id', {
                            initialValue: record.id,
                        })(
                            <Input hidden/>
                        )}
                    </FormItem> : null}
                    <div className="w-full center mt-l">
                        <FormItem wrapperCol={{span: 12, offset: 6}}>
                            <Button loading={this.props.modifyLoading}
                                    type="primary"
                                    htmlType="submit">
                                确定
                            </Button>
                        </FormItem>
                        <FormItem wrapperCol={{span: 12, offset: 6}}>
                            <Button type="primary"
                                    loading={this.props.clipAllLoading}
                                    onClick={this.props.clipAll}>
                                应用到该联赛下的所有比赛
                            </Button>
                        </FormItem>
                    </div>
                </Form>
                :
                null
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

export default connect(mapStateToProps, mapDispatchToProps)(LeagueClipForm);