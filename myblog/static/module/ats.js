/**
 * Created by zhaohui on 2015/2/7.
 */
jQuery(document).ready(function($) {
    $.extend({
        firmware:{
            available:function(os,callback){
                $.wt_post('module/avail',{
                    'm_os':os||"flyme_4.x"
                },function(json){
                    var wrap = $('#m_modules');
                    var back = callback || function(){};
                    wrap.find(".appends").remove();
                    $.each(json.data[0].modules,function(i,e){
                        var elem = $('<option/>').addClass("appends");
                        elem.attr('value', e.id);
                        elem.text(e['chsname']);
                        elem.data("model",e);
                        wrap.append(elem);
                    });
                    wrap.prop('selectedIndex',0);
                    back();
                },function(json){
                    $.alert(json.message,'danger');
                });
            },
            firmwares:function(m_date){
                $.wt_post('task/query',{
                    'm_date':m_date
                },function(json){
                    $('#firmwarestab').find('.firmware-data-row').remove();
                    var template = $('.firmware-temp-row').clone().removeClass("firmware-temp-row hidden").addClass("firmware-data-row");
                    $.each(json.data,function(i,e){
                        var row = template.clone().data('model',e);
                        row.find('.m_name').html(e.m_model + '<br/>' + e.m_name);
                        row.find('.m_version').text(e.m_version);
                        row.find('.m_type').text(e.m_type);
                        row.find('.m_dead_line').text(e.m_dead_line);
                        row.find('.m_desc').text(e.m_desc);
                        if(e.m_cloudtest){
                            row.find(".diao").removeClass("hidden");
                        }
                        if(e.m_file != null && e.m_file != ""){
                            var m_file = $.trim(e.m_file);
                            if(m_file.indexOf("\\\\172")==0){
                                row.find('.copy').attr('data-clipboard-text', m_file);
                            }else{
                                row.find('.copy').attr('data-clipboard-text', $("base").attr("href") + m_file);
                            }
                            var client = new ZeroClipboard(row.find('.copy').get(0),{moviePath:"static/lib/js/ZeroClipboard.swf"});
                            client.on("complete", function(readyEvent){
                                $.alert("固件地址已经成功复制！","success");
                            });
                        }
                        $('#firmwarestab').find('tbody').append(row);
                    });

                },function(json){
                    $.alert(json.message,'danger');
                });
            },
            add:function(m_name,m_version,m_model,m_modules,m_targets,m_type,m_cloud,m_file,m_desc,m_dead_line,m_params){
                $.wt_post("task/add",{
                    'm_name':m_name,
                    'm_version':m_version,
                    'm_model':m_model,
                    'm_modules':m_modules,
                    'm_targets':m_targets,
                    'm_type':m_type,
                    'm_cloudtest':m_cloud?1:0,
                    'm_file':m_file,
                    'm_desc':m_desc,
                    'm_dead_line':m_dead_line + ':00',
                    'm_repeat':m_params.repeat,
                    'm_span':m_params.span,
                    'm_delay':m_params.delay,
                    'm_packages':m_params.packages,
                    'm_launchonly':m_params.launchonly?"1":"0"
                },function(json){
                    $("#firmware").modal('hide');
                    $.alert(json.message,"success");
                    $.firmware.firmwares();
                },function(json){
                    $.alert(json.message,"danger");
                });
            },
            edit:function(id,m_name,m_version,m_model,m_modules,m_targets,m_type,m_cloud,m_file,m_desc,m_dead_line,m_params){
                $.wt_post("task/modify",{
                    'id':id,
                    'm_name':m_name,
                    'm_version':m_version,
                    'm_model':m_model,
                    'm_modules':m_modules,
                    'm_targets':m_targets,
                    'm_type':m_type,
                    'm_cloudtest':m_cloud?1:0,
                    'm_file':m_file,
                    'm_desc':m_desc,
                    'm_dead_line':m_dead_line + ':00',
                    'm_repeat':m_params.repeat,
                    'm_span':m_params.span,
                    'm_delay':m_params.delay,
                    'm_packages':m_params.packages,
                    'm_launchonly':m_params.launchonly?"1":"0"
                },function(json){
                    $("#firmware").modal('hide');
                    $.alert(json.message,"success");
                    $.firmware.firmwares();
                },function(json){
                    $.alert(json.message,"danger");
                });
            },
            fetch:function(id){
                $.wt_post("task/query",{
                    'id':id
                },function(json){
                    var data = json.data[0];
                    $("#id").val(data.id);
                    var exist = $("#m_model option[value='" + data.m_model + "']").size()>0;
                    if(exist){
                        $("#m_model").val(data.m_model);
                        $("#m_model_other").val("").attr("disabled","disabled");
                    }else{
                        $("#m_model").val("");
                        $("#m_model_other").val(data.m_model).removeAttr("disabled");
                    }
                    $("#m_name").val(data.m_name).trigger("change");
                    $("#m_version").val(data.m_version).data('version',data.m_version).data("model",data.m_model);
                    // 固件地址初始化
                    $("#m_path").val(data.m_file);
                    $("#m_dead_date").val(data.m_dead_date);
                    $("#m_dead_time").val(data.m_dead_time);
                    $("#m_desc").val(data.m_desc);
                    $("#firmware").modal('show');
                },function(json){
                    $.alert(json.message,"danger");
                });
            },
            del:function(id){
                $.wt_post("task/delete",{
                    'id':id
                },function(json){
                    $.alert(json.message,"success");
                    $.firmware.firmwares();
                },function(json){
                    $.alert(json.message,"danger");
                });
            },
            exists:function(m_model,m_version,m_type){
                var ex = true;
                $.wt_post("task/exists",{
                    'm_model':m_model,
                    'm_version':m_version,
                    'm_type':m_type||"uiautomator"
                },function(json){
                    ex = false;
                },function(json){
                    ex = true;
                },false);
                return ex;
            }
        },
        report:{
            summery:function(m_date){
                $.wt_post("report/uiautomator/summery",{
                    'm_date':m_date
                },function(json){
                    var data = json.data;
                    var content = $('#content');
                    var templateblock = content.find('.summery-temp-block').clone().removeClass("summery-temp-block hidden").addClass("summery-data-block");
                    var templatelabel = $('.nav.nav-tabs .summery-temp-label').clone().removeClass("summery-temp-label hidden").addClass("summery-data-label");
                    content.find(".summery-data-block").remove();
                    $('.nav.nav-tabs .summery-data-label').remove();
                    $.each(data,function(i,e){
                        //每个固件标签页内容
                        var datablock = templateblock.clone().attr('id','summery_' + e.id).data('model',e);
                        var datalebel = templatelabel.clone();
                        datalebel.find("a").attr('href',"#summery_" + e.id).text(e.m_model).attr('title', e.m_version);
                        datalebel.addClass(i == 0 ? "active":"");
                        datablock.addClass(i == 0 ? "active":"");
                        datablock.find(".model-label").text(e.m_model);
                        datablock.find(".version-label").text(e.m_version);
                        datablock.find(".rate-label").text(e.m_rate + '%');
                        //增加固件截止日期
                        datablock.find(".deadline").text(e.m_dead_line);
                        //存储固件路径 其实也可以不存储，父节点已经存储过整个获取的数据
                        if(e.m_file != null && e.m_file != ""){
                            var m_file = $.trim(e.m_file);
                            if(m_file.indexOf("\\\\172")==0){
                                datablock.find(".firmware-copy").attr('data-clipboard-text', m_file);
                            }else{

                                datablock.find(".firmware-copy").attr('data-clipboard-text', $("base").attr("href") + m_file);
                            }
                            var client = new ZeroClipboard(datablock.find('.firmware-copy').get(0),{moviePath:"static/lib/js/ZeroClipboard.swf"});
                            client.on("complete", function(evt,data){
                                $.alert("固件地址 " + data.text + " 已复制~","success");
                            });
                        }
                        var templaterow = datablock.find(".summery-temp-row").clone().removeClass("summery-temp-row hidden").addClass("summery-data-row");
                        $.each(e.m_modules,function(j,f){
                            var datarow = templaterow.clone().data("model",f);
                            if(f.m_status == 1){ // init status
                                datarow.addClass('_danger');
                                datarow.find('.m_status').text("未开始");
                            }else if(f.m_status == 2){// not done
                                datarow.addClass('_warning');
                                datarow.find('.m_status').text("未确认");
                            }else if(f.m_status == 3){// done.not ensure
                                datarow.addClass('_info');
                                datarow.find('.m_status').text("已确认");
                            }else{
                                datarow.find('.m_status').text("已确认");
                                datarow.addClass('success');
                            }
                            datarow.find('.m_name').text(f.m_name);
                            datarow.find('.m_author').text(f.m_author);
                            datarow.find('.m_total').text(f.m_total);
                            datarow.find('.m_success').text(f.m_success);
                            datarow.find('.m_error').text(f.m_error);
                            $.each(f.m_bugs,function(k,g){
                                var elem = $("<a>").attr('title', g.m_status + g.m_title);
                                elem.text("#" + g.m_bugid);
                                elem.attr("href",'http://redmine.meizu.com/issues/' + g.m_bugid);
                                datarow.find('.m_bugs').append(elem);
                                datarow.find('.m_bugs').append("&nbsp;");
                            });
                            if(f.m_bugs.length == 0){
                                datarow.find('.m_bugs').text('暂无Bug');
                            }
                            datablock.find(".firmware-detail tbody").append(datarow);
                        });
                        content.append(datablock);
                        $(".nav.nav-tabs").append(datalebel);
                    });
                },function(json){
                    $.alert(json.message, 'danger');
                }, false);
            },
            detail:function(m_module,m_module_name,target){
                $.wt_post("report/uiautomator/detail",{
                    'm_module':m_module
                },function(json) {
                    var render = target.parents(".summery-data-block").addClass("active-block").find(".module-detail").data('m_module', m_module).data('m_module_name', m_module_name).data('m_target', target);
                    render.removeClass("hidden").parent().find(".firmware-detail").addClass("hidden");
                    render.find(".detail-data-row").remove();
                    var templaterow = render.find(".detail-temp-row").clone().removeClass("detail-temp-row hidden").addClass("detail-data-row");
                    $.each(json.data, function (i, e) {
                        var datarow = templaterow.clone().data("model", e);
                        datarow.find('.m_index').text(i + 1);
                        datarow.find(".m_name").text(e.m_name).attr('title', e.m_name);
                        datarow.find(".m_steps").text(e.m_steps).attr('title', e.m_steps);
                        datarow.find(".m_expectation").text(e.m_expectation).attr('title', e.m_expectation);
                        datarow.find(".m_result").text(e.m_result ? "成功" : "失败").addClass(e.m_result ? "color-success" : "color-danger");
                        $.each(e.m_bugs, function (j, f) {
                            var elem = $("<a>").attr('title', f.m_status + f.m_title);
                            elem.text("#" + f.m_bugid);
                            elem.attr("href", 'http://redmine.meizu.com/issues/' + f.m_bugid);
                            datarow.find('.m_bugs').append(elem);
                            datarow.find('.m_bugs').append("&nbsp;");
                        });
                        datarow.find(".m_controls .m_uiauto_log").attr("href", e.m_uiauto_log).data("href", e.m_uiauto_log);
                        datarow.find(".m_controls .m_logcat_log").attr("href", e.m_logcat_log).data("href", e.m_logcat_log);
                        datarow.find(".m_controls .m_screenshot").attr("href", e.m_screenshot).data("href", e.m_screenshot);
                        render.find("tbody").append(datarow);
                    });
                    render.parents(".summery-data-block").find(".module-label").text(m_module_name).removeClass('hidden');
                    var cpu = [], fps = [], memory = [];
                    var PerformanceView = Backbone.View.extend({
                        el: render,
                        initialize: function(cpu, fps, memory) {
                            this.cpu = cpu;
                            this.fps = fps;
                            this.memory = memory;
                            this.render();
                        },
                        template: _.template($('#performance-template').html()),
                        render: function() {
                            this.$el.append(this.template({cpu: this.cpu, fps: this.fps, memory: this.memory}));
                            var groupingUnits = [[
                                'minute',
                                [1,3,5]
                            ]];
                            this.$el.find('.performance-chart').highcharts('StockChart', {
                                rangeSelector: {
                                    enabled: false
                                },
                                navigator: {
                                    enabled: true
                                },
                                tooltip: {
                                    dateTimeLabelFormats: {
                                        millisecond: "%M:%S.%L",
                                        second: "%H:%M:%S",
                                        minute: "%H:%M",
                                        hour: "%H",
                                        day: "%H:%M",
                                        week: "",
                                        month: "",
                                        year: ""
                                    },
                                    valueDecimals: 2
                                },
                                credits:{
                                    enabled:false
                                },
                                title: {
                                    text: '性能 (Performance)'
                                },
                                xAxis: {
                                    type: 'datetime',
                                    dateTimeLabelFormats: {
                                        second: '%H:%M:%S',
                                        minute: '%H:%M',
                                        hour: '%H',
                                        day: '%H:%M'
                                    }
                                },
                                yAxis: [{
                                    labels: {
                                        align: 'right',
                                        x: -3
                                    },
                                    title: {
                                        text: 'CPU'
                                    },
                                    height: '30%',
                                    lineWidth: 2
                                }, {
                                    labels: {
                                        align: 'right',
                                        x: -3
                                    },
                                    title: {
                                        text: 'FPS'
                                    },
                                    top: '32.5%',
                                    height: '30%',
                                    offset: 0,
                                    lineWidth: 2
                                }, {
                                    labels: {
                                        align: 'right',
                                        x: -3
                                    },
                                    title: {
                                        text: 'Memory'
                                    },
                                    top: '65%',
                                    height: '30%',
                                    offset: 1,
                                    lineWidth: 2
                                }],
                                series: [{
                                    name: 'CPU',
                                    data: this.cpu,
                                    yAxis: 0,
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }, {
                                    name: 'FPS',
                                    data: this.fps,
                                    yAxis: 1,
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }, {
                                    name: 'Memory',
                                    data: this.memory,
                                    yAxis: 2,
                                    dataGrouping: {
                                        units: groupingUnits
                                    }
                                }]
                            });
                            return this;
                        }
                    });
                    if (typeof json['performance'] != "undefined" && json['performance'] != null && typeof json['performance'].services != "undefined" && json['performance'].services != null && json['performance'].services.length > 0) {
                        json['performance'].services.forEach(function (element, index) {
                            var offset = index*60000;
                            var cpuRow = element['cpu'];
                            var fpsRow = element['fps'];
                            var memRow = element['mem'];
                            cpu.push([offset, parseFloat(cpuRow['avg']), parseFloat(cpuRow['max']), parseFloat(cpuRow['min']), parseFloat(cpuRow['avg'])]);
                            fps.push([offset, parseFloat(fpsRow['avg']), parseFloat(fpsRow['max']), parseFloat(fpsRow['min']), parseFloat(fpsRow['avg'])]);
                            memory.push([offset, parseFloat(memRow['avg']), parseFloat(memRow['max']), parseFloat(memRow['min']), parseFloat(memRow['avg'])]);
                        });
                        var performanceView = new PerformanceView(cpu, fps, memory);
                    } else {
                        // TODO: 补充在无数据时, 如何提示
                    }
                },function(json){
                    $.alert(json.message,"danger");
                });
            },
            reload:function(){
                var block = $("#content").find(".active-block .module-detail");
                if(block.size()>0){
                    var m_module = block.data("m_module");
                    var m_module_name = block.data("m_module_name");
                    var target = block.data("m_target");
                    $.report.detail(m_module,m_module_name,target);
                }
            },
            ensure:function(m_module){
                $.wt_post("report/uiautomator/ensure",{
                    "m_module":m_module
                },function(json){
                    $.report.summery(window.m_summery_date);
                    $.alert(json.message,"success");
                },function(json){
                    $.alert(json.message,"danger");
                });
            },
            empty:function(m_module){
                $.wt_post("report/uiautomator/empty",{
                    "m_module":m_module
                },function(json){
                    $.report.summery(window.m_summery_date);
                    $.alert(json.message,"success");
                },function(json){
                    $.alert(json.message,"danger");
                });
            },
            upload:function(m_file){
                if(m_file.files.length > 0){
                    var form = new FormData();
                    form.append('m_file',m_file.files[0]);
                    $.wt_upload('report/uiautomator/upload',form,function(json){
                        $.report.summery(window.m_summery_date);
                        $.alert(json.message,"success");
                    },function(json){
                        $.alert(json.message,"danger");
                    });
                }else{
                    $.alert("请正常选择文件！","danger");
                }
            },
            state:function(m_result){
                $.wt_post("report/uiautomator/state",{
                    "m_result":m_result
                },function(json){
                    $.report.reload();
                    $.alert(json.message,"success");
                },function(json){
                    $.alert(json.message,"danger");
                });
            },
            preview:function(target){
                var url = $(target).data("href");
                var type = $(target).data("preview");
                var preview = $("#preview");
                if(type == "img"){
                    var img = $('<img>').attr("src",url).css({'width':'98%','margin':'5px auto'});
                    preview.find(".modal-body").append(img);
                    preview.modal("show");
                }else{
                    $.get(url,function(data){
                        var pre = $('<pre>').text(data);
                        preview.find(".modal-body").append(pre);
                        preview.modal("show");
                    });
                }
            },
            final:function(m_firmware){
                $.wt_post("report/uiautomator/final",{
                    'm_firmware':m_firmware
                },function(json){
                    var data = json.data;
                    var report = $('#report');
                    var finder = report.find(".modal-body");
                    var temprow = report.find(".modal-body .bug-temp-row").clone().removeClass("bug-temp-row hidden").addClass('bug-data-row');
                    finder.find(".table .bug-data-row").remove();
                    finder.find(".report-title").text(data.m_date + " " + data.m_model.toUpperCase() + " " +data.m_name + " 自动化测试报告");
                    finder.find(".m_name").text(data.m_model.toUpperCase() + " " + data.m_name);
                    finder.find(".m_version").text(data.m_version);
                    finder.find('.m_modules strong').remove();
                    $.each(data.m_modules,function(i,e){
                        var m = $('<strong>').text(e.m_name);
                        finder.find('.m_modules').append(m);
                        if(i != data.m_modules.length - 1){
                            finder.find('.m_modules').append("<strong>、</strong>");
                        }
                    });
                    finder.find('.m_total').text(data.m_total);
                    finder.find('.m_success').text(data.m_success);
                    finder.find('.m_rate').text(data.m_rate + "%");
                    finder.find('.m_error').text(data.m_error);
                    finder.find('.m_new').text(data.m_new);
                    finder.find('.m_history').text(data.m_history);
                    finder.find('table tbody .bug-data-row').remove();
                    $.each(data.m_bugs,function(i,e){
                        var datarow = temprow.clone();
                        var elem = $('<a>').attr('title', e.m_status + e.m_title);
                        elem.text('#' + e.m_bugid);
                        elem.attr('href','http://redmine.meizu.com/issues/' + e.m_bugid);
                        datarow.find('.m_bugid').append(elem);
                        datarow.find(".m_status").text(e.m_status).addClass(e.m_status == "新增"?"color-danger":"color-primary");
                        datarow.find(".m_title").text(e.m_title);
                        datarow.find(".m_module").text(e.m_module);
                        datarow.find(".m_red_status").text(e.m_red_status);
                        datarow.find(".m_red_assign").text(e.m_red_assign);
                        finder.find("table tbody").append(datarow);
                    });
                    report.modal("show");
                },function(json){
                    $.alert(json.message,"danger");
                });
            }
        },
        bug:{
            query:function(m_result,m_type){
                $.wt_post("report/bug/query",{
                    'm_result':m_result,
                    'm_type':m_type
                },function(json){
                    var bugs = $('#bugs');
                    bugs.find("table .data-bug-row").remove();
                    var template = bugs.find("table .temp-bug-row").clone().removeClass("temp-bug-row hidden").addClass("data-bug-row");
                    $.each(json.data,function(i,e){
                        var row = template.clone().data('model',e);
                        row.find(".m_bugid").text(e.m_bugid);
                        row.find(".m_title").text(e.m_title);
                        row.find(".m_module").text(e.m_module);
                        row.find(".m_status").text(e.m_status==1?"新增":"复现");
                        bugs.find("table").append(row);
                    });
                },function(json){
                    $.alert(json.message,"danger");
                });
            },
            add:function(m_bug,m_result,m_module,m_status,m_type){
                $.wt_post("report/bug/add",{
                    'm_bug':m_bug,
                    "m_result":m_result,
                    "m_module":m_module,
                    "m_status":m_status,
                    "m_type":m_type
                },function(json){
                    var bugs = $('#bugs');
                    var template = bugs.find("table .temp-bug-row").clone().removeClass("temp-bug-row hidden").addClass("data-bug-row").data("model",json.data);
                    template.find(".m_bugid").text(json.data.m_bugid);
                    template.find(".m_title").text(json.data.m_title);
                    template.find(".m_module").text(json.data.m_module);
                    template.find(".m_status").text(json.data.m_status==1?"新增":"复现");
                    bugs.find("table").append(template);
                    $.report.reload();
                },function(json){
                    $.alert(json.message,"danger");
                },false);
            },
            del:function(m_bug,m_result,m_type){
                $.wt_post("report/bug/delete",{
                    'm_bug':m_bug,
                    'm_type':m_type
                },function(json){
                    $.alert(json.message,"success");
                    $.bug.query(m_result,m_type);
                    $.report.reload();
                },function(json){
                    $.alert(json.message,"danger");
                },false);
            }
        }
    });
});