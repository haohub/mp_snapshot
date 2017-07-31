import { getWork } from '../../actions'
import getAsynUserData from '../../util/getAsynUserData'
import packingRequest from '../../util/packingRequest'
import isEmptyObj from '../../util/isEmptyObj'

import Load from '../../components/load/load'
import renderWorkData from '../../components/work/work'
import renderCommentData from '../../components/comment/comment'
import sliderFunc from '../../components/slider/slider'
import scorePanel from '../../components/score-panel/score-panel'

const app = getApp();
const root = app.host.root;
const root_images = app.host.root_images;

const store = app.store;
const root_reducer = store.getState();
const dispatch = store.dispatch;

let access_token;
let id;

Page({
    data: {
        // 作品数据
        item: root_reducer.work,

        // 查看大图数据
        slider: root_reducer.slider,

        // 加载更多
        load_state: root_reducer.load_state,

        // 打分面板
        score_panel: root_reducer.score_panel,

        is_show_comment:true
    },
    onLoad: function ( opt ) {
        var _this = this;
        var load_state = this.data.load_state;
        var item = this.data.item;

        id = typeof opt.id !== 'undefined' && opt.id ? opt.id : '';

        if ( id ) {
          var p1 = _this.loadWorkData(id, '');

          p1.then(res => {
            item = res;

            load_state.hide_loading = true;

            if (!isEmptyObj(res)) {
              item = res;
              item.is_hide_footer = false;
              item.is_hide_work = false;
            }
            else {
              load_state.has_no_data = true;
              load_state.tips = '作品被删除';
            }

            _this.setData({
              load_state: load_state,
              item: item
            });
          }, err => {
            var status_code = err.statusCode;

            load_state.hide_loading = true;
            load_state.has_no_data = true;
            load_state.tips = status_code + '错误';

            _this.setData({
              load_state: load_state
            });
          });
        }
        else {
            throw '作品id不存在'
        }

        // 下拉刷新
        this.is_pull_down_refresh = false;

        //判断user是否存在
        wx.getStorage({
          key: 'user',
          complete: function (res) {
            var user=res.data;
            //console.log('result:' + user+'jieguo');
            if (typeof user == 'string' || !user) {
              _this.setData({
                is_show_comment: false,
              });
            }
          }
        })
    }, 
    //判断用户登录信息显示评论模块
    loginItem:function(){
      var _this = this;
      if(!_this.is_show_comment){
        wx.showToast({
          title: '微信授权登录失败,请删除小程序，重新进入'
        });
      }
    },
    loadWorkData: function ( id, access_token ) {
        var _this = this;
        var work_url = root + 'v1/works/details';

        // 渲染作品数据
       return packingRequest({
            url: work_url,
            header: {
                accesstoken: access_token
            },
            data: {
                works_id: id
            }
        }).then(res => {
            var work = res.data.data;
            var item = renderWorkData(work, root_images);
            item.comments = renderCommentData( work.comments.splice(0,10), root_images );

            // 评论加载跟多初始化
            var url = root + 'v1/works/commentlist?works_id='+item.id;
            _this.load = new Load(url, 0);
            _this.loadingHandler = _this.load.throttel(_this.loadMore, 3000);

            return Promise.resolve(item);
        }, err => {
            console.log(err);
            return Promise.reject(err);
        });
    },
    onUnload: function () {
        delete this.load;
    },
    openSlider: sliderFunc.openSlider,
    closeSlider: sliderFunc.closeSlider,
    sliderNumChange: sliderFunc.sliderNumChange,
    toggleOpenExif: sliderFunc.toggleOpenExif,
    onReachBottom: function () {
        this.loadingHandler();
    },
    openScorePanel: scorePanel.openScorePanel,
    closeScorePanel: scorePanel.closeScorePanel,
    submitScore: scorePanel.submitScore,
    getScore: scorePanel.getScore,
    startScore: scorePanel.startScore,
    gradeScore: scorePanel.gradeScore,
    loadMore: function ()  {
        var that = this;
        var item = this.data.item;
        var load_state = this.data.load_state;

        if ( load_state.is_finish ) return;

        this.load.loading(function ( res, _this ) {
            var arr = res.data.data;
            var len = arr.length;

            load_state.hide_loading = true;
            
            // 判断是否浏览完毕
            if ( !len ) {
                _this.is_finish = true;
                load_state.is_finish = true;

                return that.setData({
                    load_state: load_state
                });
            }

            // 加载数据
            item.comments = item.comments.concat(renderCommentData( arr, root_images ));

            that.setData({
                load_state: load_state,
                item: item
            });

        }, null, access_token, null, true);
    },
    onPullDownRefresh: function () {
        var _this = this;

        if ( !this.is_pull_down_refresh ) {
            this.is_pull_down_refresh = true;
            
            if ( id && access_token && !this.is_pull_down_refresh ) {    
                var p1 =  _this.loadWorkData( id, access_token );
                p1.then( item => {
                    
                    if ( load_state.is_finish ) {
                        load_state.is_finish = false;
                    }

                    this.setData({
                        item: item,
                        load_state: load_state
                    });

                    wx.stopPullDownRefresh();
                    _this.is_pull_down_refresh = false;
                    _this.load.is_finish = false;
                }, err => {
                    console.log(err);
                    wx.stopPullDownRefresh();
                    _this.is_pull_down_refresh = false;
                });
            };
        };
    },
    onShareAppMessage: function () {
        var name = '米拍|'+this.data.item.nickname+'的作品';
        var id = this.data.item.id;
        var path = '/pages/work-details/work-details?id='+id;

        return {
            title: name,
            path: path
        }
    }
});