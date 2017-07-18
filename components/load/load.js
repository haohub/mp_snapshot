import packingRequest from '../../util/packingRequest'

var ctx;

class Load {

    constructor ( host ) {
      this.host = host;
      this.is_finish = false;
      this.page_num = 2;

      this.first = true;

      this.is_request_complete = true;
    }
    loading ( cb, id, access_tocken, date, is_page  ) {      
      var _this = this;
      var url = this.host;
      
      if ( !this.is_finish ) {
          var load_state = ctx.data.load_state;
          load_state.hide_loading = false;
          
          ctx.setData({
            load_state: load_state
          });
        
          if ( _this.is_request_complete ) {
            _this.is_request_complete = false;
            if  ( is_page ) {
              packingRequest({
                url: url,
                data: {
                  page: _this.page_num,
                  per_num: 10
                }
              }).then(res => {
                _this.is_request_complete = true;
                cb(res, _this);
              }, err => {
                _this.is_request_complete = true;
                console.log(err);
              });
              _this.page_num++;
            }
            else if ( date ) {

              if ( !access_tocken ) {
                access_tocken = '';
              };
              packingRequest({
                url: url,
                header: {
                  accesstoken: access_tocken
                },
                data: {
                  nextId: id,
                  per_num: 10,
                  during: date
                }
              }).then(res => {
                _this.is_request_complete = true;
                cb(res, _this);
              }, err => {
                _this.is_request_complete = true;
                console.log(err);
              });
            }
            else {
              if ( !access_tocken ) {
                access_tocken = '';
              };
              packingRequest({
                url: url,
                header: {
                  accesstoken: access_tocken
                },
                data: {
                  nextId: id,
                  per_num: 10
                }
              }).then(res => {
                _this.is_request_complete = true;
                cb(res, _this);
              }, err => {
                _this.is_request_complete = true;
                console.log(err);
              });
            }       
          };

      }
    }
    throttel ( fn, delay ) {
      var timer;
      var start = Date.now();
      var _this = this;
      
      return function () {
        clearTimeout(timer);
        ctx = this;

        if ( _this.first ) {
          fn.apply(ctx);
          _this.first = false;
        }
        else {
          var now = Date.now();
          var delta = now - start;

          if ( delta >= delay ) {
            fn.apply(ctx);
            start = Date.now();
          }
          else {
            timer = setTimeout(() => {
              fn.apply(ctx);
            }, delay);
          }
        }
      }
    }
}
export default Load;