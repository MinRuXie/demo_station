// Class 每筆紀錄的格式
class Record {
    r_id;      // 0
    r_start;   // '2024-01-01 10:00'
    r_end;     // '2024-01-01 17:00'
    r_comment; // '備註欄位'
    
    del_btn_enable = true; // 刪除紀錄按紐
    comment_editable = false; // 備註欄位
}


var app = new Vue({
    el: '#app',
    data: {
        record_arr: [], // 記錄陣列
        timer: null, // 計時器
        timer_text: '00:00:00', // 計時器文字
        timer_btn_type: 'start', // 計時按鈕類型: 'start' | 'end'
        timer_btn_text: 'Start', // 計時按鈕文字: 'Start' | 'Stop'
        hours_magic: false, // 時數無條件進位開關
    },
    computed: {

    },
    methods: {

        // 格式化數字成兩位數 (nn)
        formatNum: function(num) {
            return num.toString().padStart(2, '0');
        },

        // 格式化表格使用的文字
        formatTableData: function(obj) {
            // [yyyy, mm, dd]
            let start_d_arr = obj.r_start ? (obj.r_start.split(' ')[0]).split('-') : undefined;
            // let end_d_arr = obj.r_end ? (obj.r_end.split(' ')[0]).split('-') : undefined;
            
            // [hh, mm, ss]
            let start_t_arr = obj.r_start ? (obj.r_start.split(' ')[1]).split(':') : undefined;
            let end_t_arr = obj.r_end ? (obj.r_end.split(' ')[1]).split(':') : undefined;

            // hs
            let origin_hs = obj.r_end ? ( ( (new Date(obj.r_end)).getTime() - (new Date(obj.r_start)).getTime() ) / 1000 / 60 / 60 ) : undefined; // 原始
            let magic_hs = obj.r_end ? Math.round(origin_hs * 4) / 4 : undefined;


            let new_obj = {
                // 日期 (yyyy-mm-dd)
                // data_d: obj.r_start ? obj.r_start.split(' ')[0] : '',

                // 日期 (mm/dd)
                data_d: obj.r_start ? `${start_d_arr[1]}/${start_d_arr[2]}` : '',

                // 時段 (hh:mm:ss)
                // data_s: obj.r_start ? obj.r_start.split(' ')[1] : '',
                // data_e: obj.r_end ? obj.r_end.split(' ')[1] : '',

                // 時段 (hh:mm)
                data_s: obj.r_start ? `${start_t_arr[0]}:${start_t_arr[1]}` : '',
                data_e: obj.r_end ? `${end_t_arr[0]}:${end_t_arr[1]}` : '',

                // 時數
                data_o_hs: origin_hs ? origin_hs.toFixed(2) : '-',
                data_m_hs: magic_hs ? magic_hs.toFixed(2) : '-',
                
                // 備註
                data_c: obj.r_comment ? obj.r_comment : ''
            }
            return new_obj;
        },

        // 取得目前日期時間的字串 (yyyy-mm-dd hh:mm:ss)
        getDateTimeString: function() {
            let now = new Date();
            let year = now.getFullYear();
            let month = this.formatNum( now.getMonth() + 1 );
            let day = this.formatNum( now.getDate() );
            let hour = this.formatNum( now.getHours() );     // 0-23
            let minute = this.formatNum( now.getMinutes() ); // 0-59
            let second = this.formatNum( now.getSeconds() ); // 0-59

            return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        },

        // 計時功能 (開始 | 暫停)
        workRecord: function() {
            let now_str = this.getDateTimeString();
            let type = this.timer_btn_type;

            switch(type) {
                // 開始
                case 'start':                
                    // 更新計時器文字
                    this.timer_text = '00:00:01';
                
                    // 每秒執行
                    this.timer = setInterval(() => {
                        let start = new Date(now_str);
                        let now = new Date();
                        let offsetTime = Math.ceil( (now.getTime() - start.getTime() ) / 1000 );

                        // let day = formatNum( Math.floor(offsetTime / 60 / 60 / 24) );
                        let hour = this.formatNum( Math.floor(offsetTime / 60 / 60) % 24 );
                        let minute = this.formatNum( Math.floor(offsetTime / 60) % 60 );
                        let second = this.formatNum( Math.floor(offsetTime) % 60 );

                        // 更新計時器文字
                        this.timer_text = `${hour}:${minute}:${second}`;
                    }, 1000);
                
                    // 更新按鈕資訊
                    this.timer_btn_text = 'Stop';
                    this.timer_btn_type = 'end';

                    // 製作一個新物件實例
                    let r = new Record();
                    r.r_id = this.record_arr.length;
                    r.r_start = now_str;
                    
                    // 將記錄加入陣列
                    this.record_arr.push(r);

                    break;
                
                // 結束
                case 'end':
                    // 清除計時器
                    clearInterval(this.timer);
                    this.timer = null;

                    // 更新計時器文字
                    this.timer_text = '00:00:00';
                
                    // 更新按鈕資訊
                    this.timer_btn_text = 'Start';
                    this.timer_btn_type = 'start';

                    // 搜尋最後一筆紀錄
                    let last_r = this.record_arr[this.record_arr.length - 1];
                    
                    // 更新紀錄
                    last_r.r_end = now_str;
                    last_r.del_btn_enable = false;

                    break;
            }
        },

        // 刪除紀錄
        removeRecord: function(id) {
            let flag = window.confirm(`確定要刪除此筆紀錄嗎？`);
            if ( !flag ) return;
            this.record_arr = this.record_arr.filter((item)=> item.r_id != id );
        },

        // 開啟 | 關閉 備註欄位
        enableComment: function(id, flag) {
            for ( r of this.record_arr ) {
                if ( r.r_id == id ) {
                    r.comment_editable = flag; // 更新資料
                }
            }
        },

        // 複製表格資料
        copyTableData: function() {
            console.log('copy start');

            // 選取表格範圍
            let el = this.$refs.recordTable;
            let body = document.body, range, sel;
            if (document.createRange && window.getSelection) {
                range = document.createRange();
                sel = window.getSelection();
                sel.removeAllRanges();
                try {
                    range.selectNodeContents(el);
                    sel.addRange(range);
                } catch (e) {
                    range.selectNode(el);
                    sel.addRange(range);
                }
            } else if (body.createTextRange) {
                range = body.createTextRange();
                range.moveToElementText(el);
                range.select();
            }

            document.execCommand("Copy"); // 複製進剪貼簿

            // setTimeout(function(){
            //     document.getSelection().removeAllRanges(); // 取消選取
            // }, 500);

            console.log('copy complete!');
        },

    },
})