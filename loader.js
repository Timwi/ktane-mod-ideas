var page = document.getElementById("page");
var searchBox = document.getElementById("searchBox");
var searchValue = "";
var sortType = "name";
var tableData = [];

var linkFormat = `<tr><td><a href="%%url%%" target="_blank">%%name%%</a><br>Author: %%author%%<br>Description: %%description%%<br>Notes: %%notes%%</td><td class="%%type%%">%%state%%</td></tr>`;
var nolinkFormat = `<tr><td><u><b>%%name%%</b></u><br>Author: %%author%%<br>Description: %%description%%<br>Notes: %%notes%%</td><td class="%%type%%">%%state%%</td></tr>`;

function getDataFile() {
    return new Promise((res, req) => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) res(this.responseText);
        };
        xhttp.open("GET", "meta?_=" + new Date().getTime(), true);
        xhttp.send();
    })
}

function generateTable(data) {
    var o = "<table>";
    data = searchData(data);
    data = sortData(data);
    for (var i = 0; i < data.length; i++) {
        if (data[i].manualUrl !== "" && data[i].manualUrl !== undefined && data[i].manualUrl !== null) {
            o += linkFormat.replace('%%url%%', data[i].manualUrl).replace('%%name%%', data[i].name).replace('%%author%%', data[i].author)
                .replace('%%description%%', data[i].description.replace(/\n/g, '<br>'))
                .replace('%%notes%%', data[i].notes.replace(/\n/g, '<br>'))
                .replace('%%type%%', "state-" + data[i].state).replace('%%state%%', data[i].state == "notReady" ? "✘" : data[i].state == "ready" ? "❖" : "✓");
        } else {
            o += nolinkFormat.replace('%%name%%', data[i].name).replace('%%author%%', data[i].author)
                .replace('%%description%%', data[i].description.replace(/\n/g, '<br>'))
                .replace('%%notes%%', data[i].notes.replace(/\n/g, '<br>'))
                .replace('%%type%%', "state-" + data[i].state).replace('%%state%%', data[i].state == "notReady" ? "✘" : data[i].state == "ready" ? "❖" : "✓");
        }
    }
    o += "</table>";
    page.innerHTML = o;
}

function doSearch() {
    searchValue = searchBox.value;
    generateTable(tableData);
}

function sortData(d, t) {
    if (!t) t = sortType;
    if (t == "state") {
        var notReady = [];
        var ready = [];
        var inProgress = [];
        for (var i = 0; i < d.length; i++) {
            if (d[i].state == "notReady") notReady.push(d[i]);
            else if (d[i].state == "ready") ready.push(d[i]);
            else if (d[i].state == "inProgress") inProgress.push(d[i]);
        }
        notReady = sortData(notReady, "name");
        ready = sortData(ready, "name");
        inProgress = sortData(inProgress, "name");
        return inProgress.concat(ready.concat(notReady));
    } else if (t == "name") {
        return d.sort((a, b) => {
            var an=a.name.toLowerCase().replace(/^the/g,'').trim();
            var bn=b.name.toLowerCase().replace(/^the/g,'').trim();
            if (t == "name") {
                return a.name < b.name ? -1 : 1;
            } else
                return 0;
        });
    }
}

function searchData(d) {
    return d.filter(a=>a.name.toLowerCase().includes(searchValue.toLowerCase()));
}

function init() {
    getDataFile().then(d => {
        d = JSON.parse(d);
        tableData = d;
        generateTable(tableData);
    }).catch(err => {
        console.error(err);
        page.innerHTML = "<h2>Error: failed to load the mod ideas</h2>";
    })
}

init();
