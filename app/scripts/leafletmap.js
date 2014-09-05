//定义地图 初始化地图
var map = L.map('map').setView([32.633592568907, 117.01007008552551],
    17);
var drawArra = {
    type: "FeatureCollection",
    features: []
};
L.Map.include(L.LayerIndexMixin);
$(document).ready(function() {


    //如果要底图，就去掉下面一段的注释,这是高德的地图

    // L.tileLayer.chinaProvider('GaoDe.Satellite.Map', {
    //     maxZoom: 18,
    //     minZoom: 5
    // }).addTo(map);

    //加载自定义的WMS服务，注意CRS设置，如果不匹配，会显现不出图层的
    L.tileLayer.wms("http://42.62.73.155/geoserver/aust/wms", {
        layers: 'aust:aust2',
        format: 'image/png',
        transparent: true,
        attribution: "AUST",
        transparent: true,
        crs: L.CRS.EPSG4326,
        version: '1.1.0'
    }).addTo(map);

    /**************************
    到下一个End 
    这段代码是绘图用的
    就是绘制覆盖物层
    这个写的相对复杂
    不过你不用管这部分
    ***************************************/
    var drawItems = new L.FeatureGroup();
    map.addLayer(drawItems);
    var drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
            polyline: {
                metric: true,
                guidelineDistance: 10,
                shapeOptions: {
                    weight: 8,
                    color: '#f357a1'
                },
                repeatMode: true
            },
            polygon: {
                allowIntersection: false,
                showArea: true,
                drawError: {
                    color: '#b00b00',
                    timeout: 1000
                },
                shapeOptions: {
                    color: '#bada55'
                },
                repeatMode: true
            },
            marker: {
                repeatMode: true
            },
            rectangle: false,
            circle: false,
        },
        edit: {
            featureGroup: drawItems,
            remove: true
        }
    });
    map.on('draw:created', function(e) {
        //////////////////////////////////////////////////
        var id = Date.now();
        $('body').append($('<div/>').attr('id', 'bg' + id).css({
            backgroundColor: 'rgba(250,250,250,0.8)',
            top: '0px',
            bottom: '0px',
            position: 'absolute',
            zIndex: 1010 + 1,
            width: '100%'
        }))
        $('body').append($('<div/>').attr('id', 'fg' + id).css({
            zIndex: 1010 + 2,
            marginTop: '30px'
        }).addClass('col-md-offset-4 col-md-4'))
        $('#fg' + id).append(　　　　　　　　　　　　
            $('<div/>').addClass("input-group")
            .append('<span class="input-group-addon">要素名称：</span>')
            .append($('<input/>').attr({
                type: 'text',
                id: 'input' + id
            }).addClass("form-control"))
        ).append(
            $('<div/>').addClass("input-group")
            .append('<span class="input-group-addon">要素说明：</span>')
            .append($('<textarea/>').attr({
                id: 'input2' + id,
                cols: 80,
                rows: 5
            }).addClass("form-control"))
        ).append(
            $('<div/>').addClass("input-group")
            .append(function() {
                var op = $('<input/>').attr({
                    type: 'hidden'
                })
                return op
            })
        ).append(function() {
            var op;
            if (e.layerType == 'marker') {
                op = $('<button/>')
                    .addClass('btn btn-success col-md-6 col-xs-6')
                    .attr({
                        type: 'button',
                        id: 'btn' + id
                    }).html('OK')
            } else {
                op = $('<button/>')
                    .addClass('btn btn-success col-md-6 col-xs-6')
                    .attr({
                        type: 'button',
                        id: 'btn' + id
                    }).html('OK')
            }
            return op
        }).append(function() {
            var op = $('<button/>')
                .addClass('btn btn-danger col-md-6 col-xs-6')
                .attr({
                    type: 'button',
                    id: 'btn2' + id,
                }).html('Cancel')
            return op
        })

        var type = e.layerType,
            layer = e.layer;
        var temp = layer.toGeoJSON();

        e.layer.oid = id
        drawArra.features.push(temp)
        drawItems.addLayer(layer);
        $('#btn' + id).click(getval);
        $('#btn2' + id).click(cacel);

        function cacel() {
            $('#bg' + id).remove();
            $('#fg' + id).remove();
        }

        function getval() {
            var name = $('#input' + id).val()
            var dist = $('#input2' + id).val()
            temp.properties = {
                oid: id,
                title: name,
                discription: dist
            }
            $('#bg' + id).remove();
            $('#fg' + id).remove();

        }
        /*****************************End************************************/
        /********************************************************************************/
        // Do whatever else you need to. (save to db, add to map etc)
        map.addLayer(layer);
        /********************************************************************************/
    });

    //这段是在点击地图的时候在地图上弹出当前点击的点的信息
    //配准的时候是用这个方法从地图上获得点的位置信息的
    //配准的时候注意经纬度的写法
    // map.on('click', function(l) {
    //     console.log(l.latlng.lat, l.latlng.lng)
    //     L.marker(l.latlng).addTo(map)
    //         .bindPopup(l.latlng.lat + ',' + l.latlng.lng).openPopup();
    // })

    map.on('draw:edited', function(e) {
        var layers = e.layers;
        layers.eachLayer(function(layer) {
            for (var i = 0; i < drawArra.features.length; i++) {
                if (drawArra.features[i].properties.oid == layer.oid) {
                    // oid相同　则修改之
                    drawArra.features[i].geometry = layer.toGeoJSON().geometry;
                }
            }
        });

    });
    map.addControl(drawControl);



    // Easy - button
    /****************
    到下一个End结束时
    这一段代码是左边的那个保存按钮
    作用是将绘制好的图形变成GeoJSON格式的数据输出
    *************************/
    var promptIcon = ['glyphicon glyphicon-floppy-save']
    var hoverText = ['保存']
    var functions = [

        function() {
            $.ajax({
                url: '/api/save',
                method: 'POST',
                data: {
                    GeoJSON: JSON.stringify(drawArra)
                },
                success: function(data) {
                    console.log('success')
                }
            })

            $("#rightbar").html('<span>' + JSON.stringify(drawArra) + '</span>')
            console.log(JSON.stringify(drawArra))
            $("#rightbar").show("slow");
        }
    ]
    $(function() {
        for (i = 0; i < 1; i++) {
            var funk = 'L.easyButton(\'' + promptIcon[i] + '\', <br/>              ' + functions[i] + ',<br/>             \'' + hoverText[i] + '\'<br/>            })'
            $('#para' + i).append('<pre>' + funk + '</pre>')
            explaination = $('<p>').attr({
                'style': 'text-align:right;'
            }).append('This created the <i class=\'fa ' + promptIcon[i] + '\'></i> button.')
            $('#para' + i).append(explaination)
            L.easyButton(promptIcon[i], functions[i], hoverText[i])
        }(i);
    })


    /*******************End**********************/



    //添加覆盖层的函数
    function addLanduseLayerAjax(url, style) {

        var templayer = new L.GeoJSON.AJAX(url, {
            dataType: "json",
            style: style,
            onEachFeature: function(feature, layer) {
                layer.bindLabel(feature.properties['title'])
                var temphtml = $('#leftbar>ul').html()
                var tempcenter = calCenter(feature.geometry.coordinates[0])
                temphtml += '<li onclick="pan2select(this)" id="' + feature.properties['oid'] +
                    '" class="list-group-item" data-center="' + tempcenter + '">' + feature.properties['title'] + '</li>'
                $('#leftbar>ul').html(temphtml)

                //搜索事件添加到这里来
                // pan2select('#' + feature.properties['oid'])
            }
        });

        templayer.addTo(map)
    }

    // 调用这个函数 参数是一个地址和覆盖物的样式
    //style 写的是覆盖物的样式，  细边线  透明中心
    addLanduseLayerAjax('json/test.json', {
        radius: 1,
        fillColor: "#fff",
        color: "#000",
        weight: 0.3,
        opacity: 0.8,
        fillOpacity: 0.01
    });



})


function pan2select(ele) {
    //点击左边列表事件 地图缩放到中心
    // 从html元素上面获取data-center数据  这个数据是对应元素计算出来的中心点
    var center = $(ele).attr('data-center')
    var t = center.split(',')
        // 将字符转换为数值
    var pos = {
        lat: Number(t[1]),
        lng: Number(t[0])
    };
    // 地图弹出窗
    var popup = L.popup()
        .setLatLng(pos)
        .setContent($(ele).html())
        .openOn(map);
    //地图动作
    map.setView(pos, 18)
}
/******面板动作**********/

//上面左右两个色块鼠标移上去的动作和点击动作
//这部分工作只是界面上的效果，和地图基本无关
$("#rightbar").hide();
$("#leftbar").hide();
$("#rightbar2").click(function() {
    $("#rightbar").hide();
})
$('#rightbar1').mouseover(function() {
    $("#leftbar").show('slow');
})
$('#rightbar1').click(function() {
    $("#leftbar").hide('slow');
})
