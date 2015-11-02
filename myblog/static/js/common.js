/**
	@name 测试平台公共js库
	@author zhaohui@meizu.com
	@date 2014-6-3 10:04:04
	@version 0.0.3
	@require jquery.min.js > 1.10.0
	@require bootstrap.min.js > 3.0.0
	@require pinyinutil.js
	@metion import after @require
	@description 封装常用js操作，复用
*/
/*jQuery 相关插件函数*/
(function($) {
	/* 封装两个业务相关的ajax，只关注业务成功失败的异常，ajax异常自消化，要求返回必须为json，且必须附带 status */
	$.extend({
        wt_upload:function(url,data,successcall,buserrcall,async,progress){
            $.ajax({
                type:'post',
                url:url,
                data:data,
                dataType:'json',
                processData:false,
                async:async,
                contentType:false,
                xhr:function(){
                    uxhr = $.ajaxSettings.xhr();
                    if(uxhr.upload && typeof progress == "function"){
                        uxhr.upload.addEventListener('progress', progress, false);
                    }
                    return uxhr;
                },
                success:function(obj){
					if(obj && obj.status === 0){
						if(typeof successcall == "function" && successcall != null){
							successcall(obj);
						}
					} else if(obj && obj.status <= -300){
                        $.alert(obj.message,"danger","警告");
                    } else{
						if(typeof buserrcall == "function" && buserrcall != null){
							buserrcall(obj);
						}
					}
				},
				error:function(xhr,resp,err){
					console.log(err);
				}
            });
        },
        /**
         * Web Test Http Post Method
         * @param url
         * @param data
         * @param [successcall] callback function
         * @param [buserrcall] callback function
         * @param [async]
         * @param [xhr2upload]
         */
		wt_post:function(url,data,successcall,buserrcall,async,xhr2upload){
			$.ajax({
				type:'post',
				url:url,
				data:data,
				dataType:'json',
				cache:false,
                processData:(typeof xhr2upload == "boolean" && xhr2upload != null?(!xhr2upload):true),
                contentType:(typeof xhr2upload == "boolean" && xhr2upload == true?false:"application/x-www-form-urlencoded"),
				async:(typeof async == "boolean" && async != null?async:true),
				success:function(obj){
					if(obj && obj.status === 0) {
						if(successcall != null && typeof successcall == "function"){
							successcall(obj);
						}
					} else if(obj && obj.status <= -300) {
                        $.alert(obj.message,"danger","警告");
                    } else {
						if(buserrcall != null && typeof buserrcall == 'function') {
							buserrcall(obj);
						}
					}
				},
				error:function(xhr,resp,err){
					console.log(err);
				}
			});
		},
		wt_get:function(url,data,successcall,buserrcall,async) {
			$.ajax({
				type:'get',
				url:url,
				data:data,
				dataType:'json',
				cache:false,
				async:(typeof async == "boolean" && async != null?async:true),
				success:function(obj){
					if(obj && obj.status === 0){
						if(typeof successcall == "function" && successcall != null){
							successcall(obj);
						}
					} else if(obj && obj.status <= -300){
                        $.alert(obj.message,"danger","警告");
                    } else {
						if(typeof buserrcall == "function" && buserrcall != null){
							buserrcall(obj);
						}
					}
				},
				error:function(xhr,resp,err){
					console.log(err);
				}
			});
		},
        wt_perm:function(perm,okcall,failcall,errcall,popenable){
            var status = false;
            $.ajax({
                type:'post',
                url:'perm',
                data:{
                    "perm":perm
                },
                dataType:'json',
                cache:false,
                async:false,
                success:function(obj){
                    if(obj && obj.status === 0){
                        if(typeof okcall == "function" && okcall != null){
							okcall(obj);
						}
                        status = true;
                    }
                    else if(obj && obj.status == -333){
                        if(typeof failcall == "function" && failcall != null){
							failcall(obj);
						}
                        if(typeof popenable == "boolean" && popenable) {
                            $.alert(obj.message, "danger");
                        }
                        status = false;
                    }else{
                        if(typeof failcall == "function" && failcall != null){
							failcall(obj);
						}
                        if(typeof popenable == "boolean" && popenable) {
                            $.alert(obj.message, "danger");
                        }
                        status = false;
                    }
                },
                error:function(xhr,resp,err){
                    if(typeof errcall == "function" && errcall != null){
                        errcall(xhr,resp,err);
                    }
                    console.log(err);
                    status = false;
                }
            });
            return status;
        },
        wt_user:function(){
			if(typeof window.current_user == "undefined" || window.current_user == null || window.current_user.id == 0){
				window.current_user = null;
				$.wt_post("common/current",null,function(json){
					window.current_user = json.data;
				},function(){
                    var user = {"email": null, "id": 0, "name": null}
				},false);
			}
            return window.current_user;
        },
		confirm:function(content,okcall,canclecall,title,hidecancle){
			var confirmdom = $('<div class="modal fade" data-backdrop="static" data-keyboard="false"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close confirm-modal-cancle" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title chsfont"></h4></div><div class="modal-body"><p class="modal-content-detail"></p></div><div class="modal-footer"><button type="button" class="btn btn-danger confirm-modal-cancle" data-dismiss="modal">取消</button><button type="button" class="btn btn-success confirm-modal-ok">确定</button></div></div></div></div>');
            if(typeof title == "string" && title.length > 0){
				confirmdom.find('.modal-title').text(title);
			}else{
				confirmdom.find('.modal-title').text("操作警告");
			}
            if(typeof hidecancle == "boolean" && hidecancle === true){
                confirmdom.find(".confirm-modal-cancle").addClass("hidden");
            }
			confirmdom.find('.modal-content-detail').html(content);
			confirmdom.find(".confirm-modal-ok").click(function(){
                var status = true;
				if(typeof okcall == "function" && okcall != null){
					status = okcall();
				}
                if(status) {
                    confirmdom.modal('hide');
                }
			});
			confirmdom.find(".confirm-modal-cancle").click(function(){
				if(typeof canclecall == "function" && canclecall != null){
					canclecall();
				}
                confirmdom.modal('hide');
			});
			$('body .sub-content').append(confirmdom);
			confirmdom.modal();
			confirmdom.modal('show');
		},
        alert:function(message,type,strong){
            var close = $('<span aria-hidden="true" style="float:right;margin-right:20px;cursor:pointer;">×</span>');
            var dom = $('<div class="mz-alert" style="position:fixed;display:none;width:100%;height:55px;top:0;text-align:center;z-index:3000;line-height:55px;font-size:20px;"><div class="content"></div></div>');
            if(type == "success"){
                dom.css({"background-color":"#dff0d8","color":"#3c763d","border-bottom":"1px solid #d6e9c6"});
            } else if(type == "info"){
                dom.css({"background-color":"#d9edf7","color":"#31708f","border-bottom":"1px solid #bce8f1"});
            } else if(type == "warning"){
                dom.css({"background-color":"#fcf8e3","color":"#8a6d3b","border-bottom":"1px solid #faebcc"});
            } else if(type == "danger"){
                dom.css({"background-color":"#f2dede","color":"#a94442","border-bottom":"1px solid #ebccd1"});
            } else{
                dom.css({"background-color":"#fcf8e3","color":"#8a6d3b","border-bottom":"1px solid #d6e9c6"});
            }
            close.click(function(){
                $(this).parents(".mz-alert").slideToggle("fast",function(){
                    close.parents(".mz-alert").remove();
                });
            });
            dom.find('.content').text(message).append(close);
            dom.appendTo($("body"));
            dom.slideToggle("fast",function() {
                setTimeout(function() {
                    close.click();
                },3000);
            });
        },
        wait:function(c){
            var content = c||"操作正在进行，请稍等……";
            var mask = $("<div class=\"modal fade in\" data-keyboard=\"false\" data-backdrop=\"static\" aria-hidden=\"false\"><div class=\"modal-dialog\" style=\"color:white;margin-top:400px;font-size:40px;\"><div class=\"wait-content\"><i class=\"fa fa-cog fa-spin\"></i>&nbsp;&nbsp;<span></span></div></div></div>");
            var waitinfo = {
                complete:function(){
                    mask.modal("hide");
                }
            };
            mask.find("span").text(content);
            mask.on('hidden.bs.modal',function(e){
                mask.remove();
            });
            mask.appendTo("body");
            mask.modal("show");
            return waitinfo;
        }
	});
	$.fn.extend({
        httpdata:function(){
            var elems = this;
            var data = {};
            $.each(elems,function(i,e){
                var id = e.id;
                data[id] = $(e).val();
            });
            return data;
        },
		validate:function(){
			var elems = this;
			var result = true;
			$.each(elems,function(i,e){
				if($(e).validatebase() == false){
					result = false;
					return false;
				}
			});
			return result;
		},
		popinfo:function(c){
			var element = this;
			element = (typeof element == 'string' ? $(element) : element);
            if(typeof element.attr("data-poptarget") != "undefined" && $(element.data("poptarget")).size()>0){
                element = $(element.data("poptarget"))
            }
			if(typeof element.attr('data-content') == "undefined"){
				element.attr('data-content','输入有误，请检查输入');
				element.attr('data-placement','auto');
				element.attr('data-container','body');
			}
			if(typeof c != "undefined" && c != null && c.length>0){
				element.attr('data-content',c);
				element.attr('data-placement','auto');
				element.attr('data-container','body');
			}
			if(typeof element.attr('data-placement') == "undefined"){
				element.attr('data-placement','auto');
			}
			if(typeof element.attr('data-container') == "undefined"){
				element.attr('data-container','body');
			}
            element.popover('show');
			var visibleCheck = setInterval(function(){
				if(!element.is(":visible")){
					element.popover('destroy');
					window.clearInterval(visibleCheck);
				}
			},200);//when this element invisible,destory the pop window.
			setTimeout(function(){
				element.popover('destroy');
			},3000);
		},
        progress:function(values,names){
            var target = $(this);
            var context = $("<div class='progress progress-scroll-bar-wrapper latin'></div>");
            var template = $("<div class='progress-bar progress-scroll-bar progress-bar-primary progress-bar-striped'><span></span><input type='text' class='progress-in'/></div>");
            var render = function(context,values){
                var params_valid = 0;
                var width = target.width();
                var avail_width = width;
                var min_percent = Number.parseFloat((30 / width).toFixed(2)) * 100;
                $.each(values,function(i,e){
                    if(e > min_percent && e <= 100){
                        params_valid += e;
                    }else if(e <= min_percent){
                        params_valid += e;
                        avail_width -= 30;
                    }else{
                        return target;
                    }
                });
                if(params_valid != 100){
                    return target;
                }
                var sumwidth = 0;
                $.each(values,function(i,e){
                    var bar = context.find(".progress-bar:eq(" + i + ")");
                    bar = bar.size() > 0?bar:template.clone().appendTo(context);
                    var current_width = 0;
                    if(i != values.length - 1){
                        current_width = Math.floor(avail_width * e * 0.01);
                        current_width = current_width <= 30?30:current_width;
                        bar.css({'width':current_width}).find("span").text(e + "%").data('progress',e);
                        bar.css({'border-right':'1px solid white'});
                    }else{
                        current_width = width - sumwidth;
                        bar.css({'width':current_width}).find("span").text(e + "%").data('progress',e);
                    }
                    if(typeof names != "undefined" && typeof names[i] != "undefined" && names[i] != null) {
                        bar.attr("title", names[i]);
                    }
                    sumwidth += current_width;
                    bar.click(function(){
                        $(this).parent().find(".active").removeClass("active");
                        $(this).addClass("active");
                        $(this).find('input').focus();
                        $(this).popinfo("使用 <- 和 -> 键调增比例");
                    });
                    bar.find('input').unbind('keydown').unbind('blur').keydown(function(e){
                        var type = 0;
                        if(e.keyCode == 37){
                            type = -1;
                        }else if(e.keyCode == 39){
                            type = 1;
                        }else if(e.keyCode == 13){
                            type = 0;
                        }else{
                            return;
                        }
                        var prev = null,next = null;
                        var parent = $(this).parents(".progress");
                        var index = $(this).parent().index();
                        var data = parent.data("progress");
                        if(index == 0){
                            next = parent.find(".progress-bar:eq(" + (index + 1) + ")");
                        }else if(index == data.length - 1){
                            prev = parent.find(".progress-bar:eq(" + (index - 1) + ")");
                        }else{
                            next = parent.find(".progress-bar:eq(" + (index + 1) + ")");
                            prev = parent.find(".progress-bar:eq(" + (index - 1) + ")");
                        }
                        var sums = 0,new_values = [],changes = type;
                        if(next != null){
                            sums = data[index] + data[index + 1];
                            new_values = [data[index] + changes,data[index + 1] - changes];
                            new_values = [Number.parseFloat(new_values[0].toFixed(2)),sums - Number.parseFloat(new_values[0].toFixed(2))];

                            if(0<=new_values[0] && new_values[0]<=sums){
                                data[index] = new_values[0];
                                data[index + 1] = new_values[1];
                                render(parent,data);
                            }else{
                                console.log(new_values[0] + "," + new_values[1]);
                            }
                        }else{
                            sums = data[index] + data[index - 1];
                            new_values = [data[index] + changes,data[index - 1] - changes];
                            new_values = [Number.parseFloat(new_values[0].toFixed(2)),sums - Number.parseFloat(new_values[0].toFixed(2))]

                            if(0 <= new_values[0] && new_values[0]<=sums){
                                data[index] = new_values[0];
                                data[index - 1] = new_values[1];
                                render(parent,data);
                            }else{
                                console.log(new_values[0] + "," + new_values[1]);
                            }
                        }
                    }).blur(function(){
                        $(this).parent().removeClass("active");
                        $(this).parent().popover('destroy');
                    });
                });
                context.data("progress",values);
                target.prop('value',values.join(','))
            };
            render(context,values);
            target.empty().append(context);
        },
		validatebase:function(){
			var element = this;
            var attrmax = element.attr("data-max");
            var attrmin = element.attr("data-min");
            var attrnmax = element.attr("data-num-max");
            var attrnmin = element.attr("data-num-min");
            var regex = element.attr("data-reg");
            var same = element.attr("data-same");
            var empty = element.attr('data-empty');
            var ajax = element.attr('data-ajax');
            var ajax_baseval = element.attr("data-ajax-baseval");
            var json = element.attr("data-json");
            var or = element.attr("data-or");
            var value = $.trim(element.val()||"");
            // 存在 data-empty 检查结果为空则直接返回验证通过
            if(typeof(empty) != 'undefined' && (value == "" || value == null)){
                if(typeof(or) != "undefined" && $(or).size()>0){
                    return $(or).validatebase();
                }else{
                    return true;
                }
            }
            //hack multiselect 不存在 data-empty 检查结果为空 弹错，同时假设是 multiselect 则在父层div弹错
            if((value == null || $.trim(value) == "") && typeof element.attr('data-empty') == 'undefined'){
				//针对select框做一个hack，通用代码不走此流程
				if(element.hasClass('multiselect')){
					var p = element.parent();
					p.popinfo();
					return false;
				}
				//正常代码
				element.popinfo();
				return false;
			}
            // 值不为空也不包含 data-empty 且元素为经过hacker的multiselect (经费统计包含人数的multiselect)
            if(element.hasClass('multiselect')){
                var groupinputs = element.next().find("li a");
                var status = true;
                groupinputs.each(function(idx,elem){
                    if($(elem).find(':checked').size()>0){
                        var existinput = $(elem).find("input[type='text']").size()>0;
                        if(existinput) {
                            var pnum = $(elem).find("input[type='text']").val();
                            if (typeof pnum == "undefined" || pnum == "" || isNaN(Number(pnum)) || Number(pnum) <= 0) {
                                var p = element.parent();
                                p.popinfo();
                                status = false;
                            }
                        }
                    }
                });
                if(!status){return false;}
            }
            //end hack
            if(typeof(attrmax) != "undefined"){
                var max = element.attr("data-max")|0;
                if(value.length>max){
                    element.popinfo();
                    return false;
                }
            }
            if(typeof(attrmin) != "undefined"){
                var min = element.attr("data-min")|0;
                if(value.length<min){
                    element.popinfo();
                    return false;
                }
            }
            if(typeof(same) != "undefined"){
                var e = $(same);
                if(value != e.val()){
                    element.popinfo();
                    return false;
                }
            }
            if(typeof(attrnmax) != "undefined"){
                var nummax = Number(element.attr("data-num-max"))||0;
                var num = Number(value);
                if(!isNaN(num)){
                    if(num>nummax){
                        element.popinfo();
                        return false;
                    }
                }else{
                    element.popinfo();
                    return false;
                }
            }
            if(typeof(attrnmin) != "undefined"){
                var nummin = Number(element.attr("data-num-min"))||0;
                var num = Number(value);
                if(!isNaN(num)){
                    if(num<nummin){
                        element.popinfo();
                        return false;
                    }
                }else{
                    element.popinfo();
                    return false;
                }
            }
            if(typeof(regex) != "undefined"){
                var regstr = element.data('reg');
                var exp = new RegExp(regstr);
                if(!exp.test(value)){
                    element.popinfo();
                    return false;
                }
            }
            if(typeof(ajax) != "undefined"){
                var url = element.attr("data-ajax");
                var bv = ajax_baseval;
                var topret = true;
                if(bv != value && (value.length > 0)){
                    $.ajax({
                        url:url,
                        type:'post',
                        data:{
                            val:value
                        },
                        dataType:'json',
                        async:false,
                        success:function(obj){
                            if(obj.status != 0){
                                element.popinfo(obj.message);
                                topret = false;
                            }
                        },
                        error:function(xhr,resp,err){
                            element.popinfo('服务器发送错误，请联系web_sta。');
                            topret = false;
                        }
                    });
                } else {
                    topret = !!(bv == value && value.length > 0);
                }
                if(!topret) {
                    element.popinfo();
                    return topret;
                }
            }
            if(typeof json != "undefined"){
                try{
                    x = JSON.parse(value)
                }catch (e){
                    element.popinfo();
                    return false;
                }
            }
            if(element.hasClass('datepicker')){
                if(/^\d{4}-\d{2}-\d{2}$/.test(value) == false){
                    element.popinfo();
                    return false;
                }else{
                    var d = (value + " 00:00:00").toDate();
                    if(d == null){
                        element.popinfo();
                        return false;
                    }
                }
            }
			return true;
		},
        groups:function(config) {
            if (this.length <= 0) {
                return;
            }
            var options = {
                multiple: false,
                classes: 'btn btn-primary',
                style: '',
                all: false,
                usingId: false
            };
            /**
             * TODO: 多选功能暂时不考虑, 最好补充不可操作选项,
             * TODO: 当控件有值时, 将值传递给组件, 初始化时设置好值, 默认方式已解决, 尚未解决采用ID的方式.
             */
            $.extend(options, config);
            var init = this;
            var tagName = init.get(0).tagName.toUpperCase();
            var value = $(init).val();
            if(value == ""){
                value = config.usingId?"1":"软件测试部";
                $(init).val(value);
            }
            if(tagName == 'INPUT') {
                if(typeof wt_groups_normal == 'undefined' || wt_groups_normal ==  null || wt_groups_normal.length == 0) {
                    $.wt_post('common/groups/normal', null, function(json) {
                        window.wt_groups_normal = json['data'];
                    }, function(json) {
                        console.error('无法加载组列表，错误：' + json['message']);
                    }, false);
                }
                init.addClass('hidden');
                var mz_groups = $('<div class="mz_groups dropdown">');
                var sign = $('<span class="caret">');
                var author = $('<a class="dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="mz_group_name"></span>&nbsp;</a>');
                var sub = $('<ul class="dropdown-menu" role="menu">');
                var empty_group = $('<li>');
                var with_sub_groups = $('<li class="dropdown">');
                var build = function(item, template) {
                    if(item != null && template != null) {
                        var name = author.clone();
                        name.find('.mz_group_name').text(item.m_name);
                        if(typeof item.m_sub != 'undefined' && item.m_sub != null && item.m_sub.length>0) {
                            name.data('id', item.id).data('name', item.m_name).append(sign.clone());
                            template.append(name);
                            var content = sub.clone();
                            if (options.all) {
                                var sub_author_all = author.clone().removeClass('dropdown-toggle').removeAttr('data-toggle');
                                var sub_element_all = empty_group.clone();
                                sub_author_all.find('.mz_group_name').text('全部');
                                sub_author_all.data('id', item.id).data('name', item.m_name).data('all', true);
                                sub_element_all.append(sub_author_all).append(sub.clone());
                                content.append(sub_element_all);
                            }
                            for(var i =0; i<item.m_sub.length; i++) {
                                var sub_element = null;
                                var sub_item = item.m_sub[i];
                                if(typeof sub_item.m_sub != 'undefined' && sub_item.m_sub != null && sub_item.m_sub.length > 0) {
                                    sub_element = with_sub_groups.clone();
                                    build(sub_item, sub_element);
                                } else {
                                    var sub_author = author.clone().removeClass('dropdown-toggle').removeAttr('data-toggle');
                                    sub_element = empty_group.clone();
                                    sub_author.find('.mz_group_name').text(sub_item.m_name);
                                    sub_author.data('id', sub_item.id).data('name', sub_item.m_name);
                                    sub_element.append(sub_author).append(sub.clone());
                                }
                                content.append(sub_element);
                            }
                            template.append(content);
                        }
                    }
                };
                var html = mz_groups.clone();// root placeholder
                build(wt_groups_normal, html);// build from root
                html.find('a:first').addClass(options.classes).attr('style', options.style);//render default toggle

                html.delegate('a', 'click', function(e) {
                    var elem = $(this);
                    var is_open = elem.parent().hasClass('open');
                    var has_sub = elem.parent().hasClass('dropdown');
                    var parent = elem.parent();
                    parent.siblings().removeClass('active open');
                    if(is_open) {
                        parent.removeClass('active open');
                    } else {
                        parent.addClass('active');
                        if(has_sub) {
                            parent.addClass('open');
                        } else {
                            var group_name = '';
                            elem.parents('li.active').each(function(i, e) {
                                if (options.all && $(e).children('a').data('all')) {
                                    // dont append sub group.
                                } else if(i != 0) {
                                    group_name = $(e).children('a').data('name') + ',' + group_name;
                                } else {
                                    group_name = $(e).children('a').data('name') + ',';
                                }
                            });
                            $(init).val(options.usingId ? elem.data('id'): group_name).data('id', elem.data('id')).data('size', elem.data('size')).trigger('change');
                            $(elem).parents('.mz_groups')
                                .removeClass('open')
                                .attr('title', group_name).find('a:first .mz_group_name').text(elem.data('name'));
                        }
                    }
                    e.stopPropagation();
                });
                $(init).parent().append(html);

                var render_value = function(value){
                    if (value != '') {
                        var values = value.split(',');
                        html.find(".active,.open").removeClass("active open");
                        if(values.length >= 2){
                            html.find('a:first .mz_group_name').text(values[values.length-1]);
                            var parent = html.find('>.dropdown-menu');
                            var activeNode = function(parent, values) {
                                var value = values.shift();
                                if (typeof value == 'undefined') {
                                    return;
                                }
                                var flag = -1;
                                parent.find('>li>a>span.mz_group_name').each(function(m, n) {
                                    if ($(n).text() == value) {
                                        $(n).parents('li').addClass('active');
                                        flag = m;
                                    }
                                });
                                if (values.length > 0 && flag >= 0) {
                                    var childs = parent.find('>li>.dropdown-menu');
                                    if (childs.length >= flag) {
                                        activeNode($(childs[flag]), values);
                                    }
                                }
                            };
                            activeNode(parent, values);
                        }else{
                            var activeId = value||1;
                            html.find("li a").each(function(i,e){
                                var dataId = $(this).data("id")||0;
                                if(dataId == activeId){
                                    $(this).parents("li").addClass("active");
                                    $(this).click();
                                    $(this).parents("li").each(function(i,e){
                                        if($(e).hasClass("dropdown") && (!$(e).hasClass("mz_groups"))){
                                            $(e).addClass('active open');
                                            if($(e).hasClass('mz_groups')){
                                                return false;
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }else{
                        var tips_value = "请选择组别";
                        html.find('a:first .mz_group_name').attr('title', tips_value).text(tips_value);
                        html.find(".active,.open").removeClass("active open");
                    }
                };
                render_value(value);
                $(init).bind('refresh',function(){
                    var val = $(this).val();
                    render_value(val);
                });
            }
            return this;
        },
        pinyin:function(config) {
            var elem = this;
            var tagName = elem.get(0).tagName.toUpperCase();
            var type = elem.attr("type").toUpperCase();
            var template = $("<ul class='pinyin-selection'>");
            var sub_t = $("<li>");
            config = $.extend({
                'multiple':false
            },config);
            var loadusers = function(){
                $.wt_post("common/users",null,function(json) {
                    window.wt_users = json.data;
                },function(json){
                    console.error("无法加载用户列表，错误：" + json.message);
                },false);
            };
            if(typeof wt_users == "undefined" || wt_users ==  null || wt_users.length == 0 && typeof HanZi_PinYin != "undefined"){
                loadusers();
            }
            if(tagName == "INPUT" && type == "TEXT"){
                if(typeof wt_users != "undefined" && wt_users != null && wt_users.length>0){
                    var target = template.clone();
                    $.each(wt_users,function(i,e){
                        var item = sub_t.clone();
                        item.data("id", e.id);
                        item.data("email", e.email);
                        item.data("name", e.name);
                        item.data("pinyin",HanZi_PinYin.get(e.name));
                        item.text(e.name);
                        item.click(function(){
                            var id = item.data("id");
                            var name = item.data("name");
                            var email = item.data("email");
                            if(!config.multiple){
                                elem.val(name);
                                elem.data("uid",id);
                                elem.data("name",name);
                                elem.data("email",email);
                                console.log('call...');
                                target.css({"display":"none"});
                            }else{
                                var text = elem.val();
                                var matches = /^([\u4e00-\u9eff]{2,5}[;])*([a-zA-Z]{1,5})$/.exec(text);
                                var uids = elem.data("uid");
                                var names = elem.data("name");
                                var mails = elem.data("email");
                                if(matches != null){
                                    if(typeof uids == "undefined" || uids == null || uids.length == 0){
                                        elem.val(name + ";");
                                        elem.data("uid",[id]);
                                        elem.data("name",[name]);
                                        elem.data("email",[email]);
                                        target.css({"display":"none"});
                                    }else{
                                        if(uids.indexOf(id) >=0){
                                            elem.popinfo("`" + name + "` 已经被选择了~")
                                        }else{
                                            uids.push(id);
                                            names.push(name);
                                            mails.push(email);
                                            var value = text.replace(matches[2],"") + name + ";";
                                            elem.val(value);
                                            target.css({"display":"none"});
                                        }
                                    }
                                }else{
                                    target.css({"display":"none"});
                                    elem.val("").popinfo("抱歉，输入不合法，请重新选择！");
                                    elem.data("uid",null).data("email",null);
                                    console.log("丢，你的输入显然不合法……")
                                }
                            }
                            target.find("li").filter('.current').removeClass("current").css({"background-color":'transparent'});
                        });
                        target.append(item);
                    });
                    target.insertAfter(elem);
                    elem.keydown(function(e){
                        var whitelist = [8,38,40,13];//backspace、up、down、enter
                        var keycode = e.keyCode;
                        if(whitelist.indexOf(keycode)<0){
                            return;
                        }
                        var current = target.find("li").not('hidden').filter('.current');
                        if(keycode == 8){
                            var text = elem.val();
                            var uids = elem.data("uid")||[];
                            var names = elem.data("name")||[];
                            var mails = elem.data("email")||[];
                            if(!config.multiple){
                                elem.val("").data("uid",null).data("name",null).data("email",null);
                            }else{
                                if(text == names.join(";") + ";" && uids != null && uids != "" && uids.length > 0){
                                    uids.pop();
                                    names.pop();
                                    mails.pop();
                                    var _val = names.join(";");
                                    elem.val(_val == ""?"":_val + ";");
                                    e.preventDefault();
                                }
                            }
                        }else if(keycode == 38){
                            if(current.size()>0){
                                var prev = current.prev();
                                while(prev.size()>0 && prev.hasClass('hidden')){
                                    prev = prev.prev();
                                }
                                if(prev.size() > 0){
                                    current.removeClass("current").css({"background-color":'transparent'});
                                    prev.addClass("current").css({"background-color":'#EEE'});
                                }
                            }else{
                                target.find("li").not('.hidden').last().addClass("current").css({"background-color":'#EEE'});
                            }
                        }else if(keycode == 40){
                            if(current.size()>0){
                                var next = current.next();
                                while(next.size()>0 && next.hasClass('hidden')){
                                    next = next.next();
                                }
                                if(next.size() > 0){
                                    current.removeClass("current").css({"background-color":'transparent'});
                                    next.addClass("current").css({"background-color":'#EEE'});
                                }
                            }else{
                                target.find("li").not('.hidden').first().addClass("current").css({"background-color":'#EEE'});
                            }
                        }else if(keycode == 13){
                            current.trigger('click');
                        }
                        e.stopPropagation();
                    });
                    elem.keyup(function(e) {
                        var py = $(this).val().toUpperCase();
                        py = $.trim(py);
                        var regexp_single = /^([\u4e00-\u9eff]{2,5}|[a-zA-Z]{1,5})$/;
                        var regexp = /^([\u4e00-\u9eff]{2,5}[;])*([a-zA-Z]{1,5})?$/;
                        var width = elem.get(0).clientWidth + "px";
                        target.css({'width': width});
                        if(py != "" && ((!regexp.test(py) && config.multiple) || (!regexp_single.test(py) && !config.multiple))) {
                            elem.val("").data("uid",null).data("name",null).data("email",null);
                            $(elem).popinfo("此输入项只接受5个以内的拼音缩写检索！");
                        }else{
                            if(py != "") {
                                var exists = false;
                                var _py = null;
                                if(config.multiple){
                                    _py = regexp.exec(py)[2];
                                }else{
                                    _py = py;
                                }
                                if(_py != ""){
                                    target.find('li').each(function(i,e) {
                                        var pinyin = $(e).data("pinyin");
                                        if(pinyin.indexOf(_py) == -1) {
                                            $(e).addClass("hidden");
                                        } else {
                                            $(e).removeClass("hidden");
                                            exists = true;
                                        }
                                    });
                                    target.css({"display":exists?"block":"none"});
                                }else{
                                    target.css({"display":"none"});
                                }
                            } else {
                                target.css({"display":"none"});
                            }
                        }
                    });
                }
            } else {
                return -1;
            }
        },
        mulpinyin:function(){
            return this.pinyin({
                'multiple':true
            });
        },
        nativepage:function(topage,tag,index,size,items){
            var elem = this;
            var total = topage.find(tag).size();
            //buss hide
            if(total>0){
                var range = [(index -1)*size,index * size];
                if(range[0]>=0){
                    topage.find(">" + tag + ":lt(" + range[0] +")").addClass("hidden");
                    for(var i = range[0];i < range[1];i++){
                        topage.find(">" + tag + ":eq(" + i +")").removeClass("hidden");
                    }
                    topage.find(">" + tag + ":gt(" + (range[1] - 1)  +")").addClass("hidden");
                }
            }  //end
            $(elem).pagination(index,size,total,function(i,s,t,d){
                $(elem).empty().nativepage(topage,tag,i,s,items);
            },items);
        },
        pagination:function(pageIndex,pageSize,totalSize,callback,displayItem){
            var elem = this;
            var display = typeof displayItem == "number"?(displayItem>=1?displayItem:7):7;
            var pageCount = Math.ceil(totalSize/pageSize);
            var indexRange = [];
            if(pageCount <= display){
                for(var i = 1;i<=pageCount;i++){
                    indexRange.push(i);
                }
            }else{
                var startIndex = 0,endIndex = 0;
                if(pageIndex - Math.floor(display/2) >= 1 && pageIndex + Math.floor(display/2) <= pageCount ){
                    startIndex = pageIndex - Math.floor(display/2);
                    endIndex = startIndex + display - 1;
                }
                else{
                    var headmins = pageIndex - Math.floor(display/2);
                    var tailplus = pageIndex + Math.floor(display/2);
                    if(headmins < 1 && tailplus <= pageCount){
                        startIndex = 1;
                        endIndex = startIndex + display - 1;
                    }else if(headmins >= 1 && tailplus > pageCount){
                        endIndex = pageCount;
                        startIndex = endIndex - display + 1;
                    }else{
                        console.log("尼玛，这不可能！");
                    }
                }
                for(var i = startIndex;i<=endIndex;i++){
                    indexRange.push(i);
                }
            }
            var disablePrev = pageIndex == 1;
            var disableNext = pageIndex == pageCount;
            var activeCurrent = true;
            var holdertemplate = $("<ul class='pagination'></ul>");
            var itemtemplate = $("<li><a href='javascript:void(0);'></a></li>");
            var prevtemplate = $("<li><a href='javascript:void(0);'>&laquo;</a></li>");
            var nexttemplate = $("<li><a href='javascript:void(0);'>&raquo;</a></li>");
            //start build pagination
            if(disablePrev) {
                prevtemplate.addClass("disabled");
            } else {
                prevtemplate.data("index",pageIndex - 1);
            }
            holdertemplate.append(prevtemplate);
            $.each(indexRange,function(i,e) {
                var item = itemtemplate.clone().data("index",e);
                item.find("a").text(e);
                if(pageIndex == e && activeCurrent) {
                    item.addClass("active");
                }
                holdertemplate.append(item);
            });
            if(disableNext){
                nexttemplate.addClass("disabled");
            }else{
                nexttemplate.data("index",pageIndex + 1);
            }
            holdertemplate.append(nexttemplate);
            holdertemplate.find("li:not(.action,.disabled) a").click(function(){
                var index = $(this).parent().data("index");
                if(typeof callback == "function" && callback != null){
                    callback(index,pageSize,totalSize,display);
                    $("body").stop().animate({scrollTop:0}, '500', 'swing', function() {
                    });
                }
            });
            elem.append(holdertemplate);
        }
    });
})(jQuery);

jQuery(document).ready(function($){
    //init all pikaday
    $(".datepicker").each(function(i,e){
        new Pikaday({
            field:e
        });
    });
    // init timepicker and disable user input
    $(".clockpicker").clockpicker({autoclose:true});
    $('.clockpicker>input').attr("readonly","readonly");

    //以下代码依赖DOM树的状态


});

/*不要覆盖原生的js代码，而应该通过prototype扩充*/
String.prototype.toDate = function(){
    if(/\d\d\d\d-\d\d-\d\d\s\d\d:\d\d:\d\d/.test(this)){
        var y = this.substring(0,4)|0;
        var m = (this.substring(5,7)|0)-1;
        var d = this.substring(8,10)|0;
        var h = this.substring(11,13)|0;
        var mi = this.substring(14,16)|0;
        var s = this.substring(17,19)|0;
        var date = new Date();
        date.setTime(0);
        date.setFullYear(y);
        date.setDate(d);
        date.setMonth(m);
        date.setHours(h);
        date.setMinutes(mi);
        date.setSeconds(s);
        if(date.getFullYear()!=y || date.getMonth() != m || date.getDate() != d){
        	return null;
        }
        return date;
    }
    return null;
};

vl = function(a,b,c){
    if(typeof a == "undefined" || a == null){
        return b;
    }else{
        if(typeof a == "string"){
            return a.effect(b).toString();
        }
        else if(typeof a == "number"){
            return a.effect(b).toString();
        }
        else if(typeof a == "object"){
            if(typeof a.length != "undefined"){
                if(a.length>0){
                    return a.join("、").toString();
                }else{
                    return "无";
                }
            }else{
                var ser = "";
                for(k in a){
                    ser += (k + ":" + a[k] + "、");
                }
                if(ser == ""){
                    return "无";
                }else{
                    return ser.substring(0,ser.length-1);
                }
            }
        }
    }
};

String.prototype.effect = function(a){
    if($.trim(this) == ""){
        return typeof a == "undefined"?"无": a.toString();
    }else{
        return this;
    }
};

Number.prototype.effect = function(a){
    if(isNaN(this)){
        return (typeof a == "number" && (!isNaN(a)))? a.toFixed(2):"---";
    }else{
        return this.toFixed(2);
    }
};

var lunaDate = function(strDate){
	var MONTHS = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
	var NUMS = ['','一','二','三','四','五','六','七','八','九','十'];
	var KEYS = ['初','十','廿','三十'];
	var FIX = "(农历)";
	var ranges = [[1,10],[11,19],[20,29],[30,31]];
	var month = strDate.substring(0,2) || 0;
	var days = strDate.substring(3,5) || 0;
	if(days>=1 && days<=31){
		for(var i=0;i<ranges.length;i++){
			if(days>=ranges[i][0] && days<=ranges[i][1]){
				return MONTHS[month-1] + KEYS[i] + NUMS[days%10==0?10:days%10] + FIX;
			}
		}
	}else{
		return strDate;
	}
};