var page = document.getElementById("page");
var searchBox = document.getElementById("searchBox");
var searchValue = "";
var sortType = "name";
var tableData = [];

var linkFormat = `<tr>
    <td>
        <div>
            <a class="mod-name" href="%%url%%" target="_blank">%%name%%</a>
            &nbsp;
            <i class="mod-author">by %%author%%</i>
        </div>
        %%description%%
        %%notes%%
    </td>
    <td class="%%type%%">%%state%%</td>
</tr>`;
var nolinkFormat = `<tr>
    <td>
        <div>
            <b class="mod-name">%%name%%</b>
            &nbsp;
            <i class="mod-author">by %%author%%</i>
        </div>
        %%description%%
        %%notes%%
    </td>
    <td class="%%type%%">%%state%%</td>
</tr>`;

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

function colourSpecialAuthor(n) {
    var m=n.split(",");
    var table={"blananas2":"mod-author-blananas","mrmelon":"mod-author-mrmelon"};
    return m.map(b=>{
        b=b.trim();
        if(table[b.toLowerCase()]===undefined)return b;
        return `<span class="${table[b.toLowerCase()]}">${b}</span>`;
    }).join(', ');
}

function generateTable(data) {
    var o = "<div><table>";
    if(searchValue!="") data = searchData(data);
    data = sortData(data);
    for (var i = 0; i < data.length; i++) {
        if (data[i].manualUrl !== "" && data[i].manualUrl !== undefined && data[i].manualUrl !== null) {
            o += linkFormat.replace('%%url%%', data[i].manualUrl).replace('%%name%%', data[i].name).replace('%%author%%', colourSpecialAuthor(data[i].author))
                .replace('%%description%%', data[i].description==''?'':('<div class="mod-description">'+data[i].description.replace(/\n/g, '<br>').replace(/&quot;/g,'"')+'</div>'))
                .replace('%%notes%%', data[i].notes==''?'':('<div class="mod-notes">'+('('+data[i].notes+')').replace(/\n/g, '<br>').replace(/&quot;/g,'"')+'</div>'))
                .replace('%%type%%', "state-" + data[i].state).replace('%%state%%', data[i].state == "notReady" ? "✘" : data[i].state == "ready" ? "❖" : data[i].state == "inProgress" ? "✓" : "?");
        } else {
            o += nolinkFormat.replace('%%name%%', data[i].name).replace('%%author%%', colourSpecialAuthor(data[i].author))
                .replace('%%description%%', data[i].description.replace(/\n/g, '<br>').replace(/&quot;/g,'"'))
                .replace('%%notes%%', data[i].notes.replace(/\n/g, '<br>').replace(/&quot;/g,'"'))
                .replace('%%type%%', "state-" + data[i].state).replace('%%state%%', data[i].state == "notReady" ? "✘" : data[i].state == "ready" ? "❖" : data[i].state == "inProgress" ? "✓" : "?");
        }
    }
    o += "</table><div><b style=\"float:right;\">"+data.length+"</b></div></div>";
    page.innerHTML = o;
}

function doSearch() {
    searchValue = searchBox.value;
    generateTable(tableData);
}

function sortData(d, t) {
    if (!t) t = document.querySelector('input[name="sort-type"]:checked').value;
    if (t == "state") {
        var notReady = [];
        var ready = [];
        var inProgress = [];
        var unknown=[];
        for (var i = 0; i < d.length; i++) {
            if (d[i].state == "notReady") notReady.push(d[i]);
            else if (d[i].state == "ready") ready.push(d[i]);
            else if (d[i].state == "inProgress") inProgress.push(d[i]);
            else if(d[i].state=="unknown") unknown.push(d[i]);
        }
        notReady = sortData(notReady, "name");
        ready = sortData(ready, "name");
        inProgress = sortData(inProgress, "name");
        unknown=sortData(unknown,"name");
        return inProgress.concat(ready.concat(notReady.concat(unknown)));
    } else if (t == "name") {
        return d.sort((a, b) => {
            var an = a.name.toString().toLowerCase().replace(/^the/g, '').trim();
            var bn = b.name.toString().toLowerCase().replace(/^the/g, '').trim();
            if (t == "name") {
                return a.name < b.name ? -1 : 1;
            } else
                return 0;
        });
    }
}

function searchFilter(a,t,v) {
    return a[t].toString().toLowerCase().includes(v);
}

function searchDump(d) {
    var v=searchValue.toLowerCase();
    if(v.indexOf("n:")==0) {
        return searchFilter(d,"name",v.substr(2,v.length));
    } else if(v.indexOf("a:")==0) {
        return searchFilter(d,"author",v.substr(2,v.length));
    } else if(v.indexOf("desc:")==0) {
        return searchFilter(d,"description",v.substr(5,v.length));
    } else if(v.indexOf("notes:")==0) {
        return searchFilter(d,"notes",v.substr(6,v.length));
    } else if(v.indexOf("s:")==0) {
        return searchFilter(d,"state",v.substr(2,v.length));
    }
    return searchFilter(d,"name",v)||searchFilter(d,"author",v)||searchFilter(d,"description",v)||searchFilter(d,"notes",v)||searchFilter(d,"state",v);
}

function searchData(d) {
    return d.filter(a=>searchDump(a));
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
