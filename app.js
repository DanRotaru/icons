var $ = function(element, querySelector) {
    if (this.__proto__.constructor !== $) return new $(element, querySelector);

    if(querySelector == 1) this.el = document.querySelector(element);
    else if(querySelector == 2) this.el = document.querySelectorAll(element);
    else {
        if(element[0] == ".") this.el = document.querySelector(element);
        else if(element[0] == "#") {
            element = element.substring(1);
            this.el = document.getElementById(element);
        }
        else this.el = document.getElementById(element);
    }

    this.html = function(html) {
        if(this.el.length > 1) this.el.forEach(el => el.innerHTML = html);
        else this.el.innerHTML = html;
        return this.el;
    }

    this.text = function(text) {
        if(this.el.length > 1) this.el.forEach(el => el.innerText = text);
        else this.el.innerText = text;
        return this.el;
    }
    this.val = function(value) {
        if(value){
            if(this.el.length > 1) this.el.forEach(el => el.value = value);
            else this.el.value = value;
            return this.el;
        }
        else if(value == ""){
            if(this.el.length > 1) this.el.forEach(el => el.value = value);
            else this.el.value = value;
            return this.el;
        }
        else{
            return this.el.value;
        }
    }

    this.addClass = function(className) {
        if(this.el.length > 1) this.el.forEach(el => el.classList.add(className));
        else this.el.classList?.add(className);
        return this.el;
    }

    this.removeClass = function(className) {
        if(this.el.length > 1) this.el.forEach(el => el.classList.remove(className));
        else this.el.classList?.remove(className);
        return this.el;
    }

    this.attr = function(attribute, value) {
        if(value){
            if(this.el.length > 1) this.el.forEach(el => el.setAttribute(attribute, value));
            else this.el?.setAttribute(attribute, value);
            return this.el;
        }
        else{
            return this.el.getAttribute(attribute);
        }
    }

    this.on = function(event, callback){
        if(this.el.length > 1 && this.el.tagName !== "SELECT") this.el.forEach(el => {
            el.addEventListener(event, () => {
                if(callback) callback(el);
            });
        });
        else this.el.addEventListener(event, () => {
            if(callback) callback(this.el);
        });
        return this.el;
    }

    this.click = function(callback){
        this.on('click', callback);
    }
    this.focus = function(){
        this.el.focus();
        return this.el;
    }
};

function req(url, cb, errcb){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.onload = function() {
        if (xhr.status != 200) {
            if(errcb) errcb(xhr)
        } else {
            if(cb) cb(xhr.response);
        }
    };

    xhr.onerror = () => {
        if(errcb) errcb(xhr);
    }
}

const CORS = 'https://api.allorigins.win/raw?url=';
var copyTimeout;

function getIcons(res){
    let num = 0, data = '';
    res = JSON.parse(res);
    console.log(res);

    for (const icon of res.icons) {
        let fill = "#6F6F6F";
        fill = "#fff";

        let aliases = icon.aliases;
        if(aliases == undefined || aliases == "") aliases = icon.name;
        else aliases = aliases + "," + icon.name;
        
        data += `<div tooltip="${icon.name}" data-alias="${aliases}" flow="down" data-id="${icon.id}" data-by="${icon.user.name}"><svg viewBox="0 0 24 24"><path data-name="${icon.name}" fill="${fill}" d="${icon.data}"></path></svg></div>`;
        num++;
    }
    $("#icons").html(data);
    $("#nicons").text(num);
    $("#search").attr("placeholder", `Search ${num} icons (Press "/" to focus)`);
    
    // add click event on all icons
    $("#icons div", 2).click((el) => {
        $("main, aside", 2).addClass("active");
        $("#icons div", 2).removeClass("active");
        let id = el.getAttribute("data-id"),
            name = el.getAttribute("tooltip"),
            contributor = el.getAttribute("data-by");

        let path = $(`#icons div[data-id="${id}"] path`, 1).attr("d");
        $(`#icons div[data-id="${id}"]`, 1).addClass("active");
        $(".icon-title__name").text(name);
        $(".icon-title__contributor").text(contributor);
        $(".icon-preview svg path").attr("d", path);
        clearTimeout(copyTimeout);
        $(".copy").text("Copy");

        $(".aside-bg").removeClass("h");
    });
}


$("#color").on("input", (el) => {
    let val = el.value.toUpperCase();
    $("#color1").val(val);
    $("#color1").addClass("u");
    $(".toCurrentColor").removeClass("h");
    $(".icon-preview svg path").attr("fill", val);
});

$("#color1").on("input", (el) => {
    let val = el.value.toUpperCase();
    $("#color").val(val);
    $("#color").addClass("u");
    $(".toCurrentColor").removeClass("h");
    $(".icon-preview svg path").attr("fill", val);
});

$(".toCurrentColor").click(() => {
    $("#color").val("#FFFFFF");
    $("#color1").val("currentColor");
    $("#color1").removeClass("u");
    $(".toCurrentColor").addClass("h");
    $(".icon-preview svg path").attr("fill", "#FFFFFF");
});

$("aside .close, .aside-bg", 2).click(() => {
    $("aside", 1).removeClass("active");
    $(".aside-bg").addClass("h");
});


$(".copy").click(function(){
    if(!navigator.clipboard) return;
    clearTimeout(copyTimeout);
    $(".copy").text("Copy");

    let data;
    let fill = $("#color1").val();
    let copy = $("#copy-type").val();
    let path = $(".icon-preview svg path").attr("d");
    if(copy == 1) data = `<svg viewBox="0 0 24 24"><path fill="${fill}" d="${path}"/></svg>`;
    else if(copy == 2){
        let base = 'data:image/svg+xml,';
        data = `<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path fill='${fill}' d='${path}'/></svg>`;
        data = data.replace(/[\r\n%#()<>?\[\\\]^`{|}]/g, encodeURIComponent );
        data = `<img src="${base}${data}"/>`;
    }
    else if(copy == 3) data = `<path fill="${fill}" d="${path}"/>`;
    else if(copy == 4) data = path;
    else if(copy == 5) {
        let base = 'background-image: url("data:image/svg+xml,';
        data = `<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path fill='${fill}' d='${path}'/></svg>`;
        data = data.replace(/[\r\n%#()<>?\[\\\]^`{|}]/g, encodeURIComponent );
        data = `${base}${data}");`;
    }
    else if(copy == 6) {
        let base = 'url("data:image/svg+xml,';
        data = `<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path fill='${fill}' d='${path}'/></svg>`;
        data = data.replace(/[\r\n%#()<>?\[\\\]^`{|}]/g, encodeURIComponent );
        data = `${base}${data}");`;
    }
    else if(copy == 7) {
        let base = 'data:image/svg+xml,';
        data = `<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path fill='${fill}' d='${path}'/></svg>`;
        data = data.replace(/[\r\n%#()<>?\[\\\]^`{|}]/g, encodeURIComponent );
        data = `${base}${data}`;
    }
    else if(copy == 8) {
        data = `<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path fill='${fill}' d='${path}'/></svg>`;
        data = data.replace(/[\r\n%#()<>?\[\\\]^`{|}]/g, encodeURIComponent );
        data = `${data}`;
    }

    navigator.clipboard.writeText(data);
    $(".copy").text("Copied");
    copyTimeout = setTimeout(() => $(".copy").text("Copy"), 3000);
});

$(".download").click(function(){
    let val = $("#icon-download").val();
    let id = $("#icons div.active", 1).attr("data-id");
    if(val == "svg") document.location.href = "https://materialdesignicons.com/api/download/icon/svg/"+id;
    else document.location.href = "https://materialdesignicons.com/api/download/icon/png/"+id+"/"+val;
});

function searchInput(val){
    val = val.toLowerCase();
    if(val == ""){
        $("#icons div", 2).removeClass("h");
    }else{
        $("#icons div", 2).addClass("h");
        if(val.search("/") !== -1){
            let a = val.replace(/ /g, '').split("/");
            let len = val.split("/").length - 1;
            for(let i = 0; i <= len; i++){
                $("#icons div[data-alias*='"+a[i]+"']", 2).removeClass("h");
            }
        }else{
            $("#icons div[data-alias*='"+val+"']", 2).removeClass("h");
        }
    }
}

$("#search").on("input", (el) => searchInput(el.value));

$("#tags").on("change", (el) => {
    let val = el.value;
    $("#search").val(val);
    $("#search").focus();
    searchInput(val);
});
document.addEventListener('keyup', (e) => {
    if(e.target.tagName !== "INPUT"){
        if(e.keyCode == 191) $("#search").focus();
    }
});
document.addEventListener('scroll', () => {
    let top = window.pageYOffset;
    if(top >= 200) $(".main-header").addClass("active");
    else $(".main-header").removeClass("active");
});

if(localLoad){ // loading from icons.json
    req('icons.json', (res) => {
        getIcons(res);
    }, () => {
        $("#icons").innerText = "Error loading icons, try again...";
    });
}
else{
    req(CORS + 'https://materialdesignicons.com/api/init', (init) => {
        init = JSON.parse(init);
        req(CORS + 'https://materialdesignicons.com/api/package/' + init.packages[0].id, (res) => {
            getIcons(res);
        }, () => {
            $("#icons").innerText = "Error loading icons, try again...";
        });
    }, () => {
        $("#icons").innerText = "Error loading icons, try again...";
    });
}