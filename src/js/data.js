'use strict';
//---------------------------------------------
window.onload = start;

let initObj = {
    partnersFlag: false,
    graphClickFlag: false,
    sliderCurrentFlag: 0,
    defaultSortParam: 'pctUp'
};

let currentComp;
let dataCompArr;
let dataNewsArr;

function start() {
    showLoaders();

    getDataFromServer('http://codeit.pro/codeitCandidates/serverFrontendTest/company/getList')
        .then(data => {
            let removeLoaderArr = ['total', 'list', 'location', 'partners'];
            removeLoader(removeLoaderArr);
            dataCompHandling(data);
        });

    getDataFromServer('http://codeit.pro/codeitCandidates/serverFrontendTest/news/getList')
        .then(data => {
            let removeLoaderArr = ['news'];
            removeLoader(removeLoaderArr);
            DataNewsHandling(data);
        });
}
//----------rebuild when resizeWind-----------
function rebuildIfResize(countryLocArr) {
    window.onresize = function() {
        if(document.getElementById('chart')) {
            document.getElementById('chart').remove();
            buildGraph(countryLocArr);
        }
        if (document.querySelector('.scrollCont')) {
            let widthPartnCont = window.innerWidth < 768 ? 125: 190;
            let partners = findPartnArr(currentComp, dataCompArr);
            let widthScrollCont = partners.length * widthPartnCont;
            document.querySelector('.scrollCont').style.width = `${widthScrollCont}px`;
        }
    }
}
//-------show loaders-------------
function showLoaders() {

    let loader = document.createElement('div');
    loader.className = 'loader';
    let parentArr = Array.from(document.getElementsByClassName('inner'));

    parentArr.forEach(val => {
        val.insertBefore(loader.cloneNode(true), val.firstChild);
    });
}
//-------------showPartnersDiv---------------
function showPartnersDiv() {
    let mainDiv = document.querySelector('.main');
    mainDiv.classList.add('mainWithPartners');
    let partnerDiv = document.querySelector('.main__partners');
    partnerDiv.style.display = "block";
}
//------------getDataFromServer---------------
function getDataFromServer(url) {
    return new Promise((res, rej) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function() {
            if (this.status == 200) {
                res(JSON.parse(this.response));
            } else {
                let error = new Error(this.statusText);
                rej(error);
            }
        };
        xhr.send();
    });
}
//-------------dataCompHandling-------------------
function dataCompHandling(data) {
    dataCompArr = data.list;
    showTotal(dataCompArr);
    buildList(dataCompArr);
    bindClickOnList();
    let countryLocArr = buildCountryLocObj(dataCompArr);
    buildGraph(countryLocArr);
    rebuildIfResize(countryLocArr);
}
//-----------removeLoader---------------
function removeLoader(arr) {
    arr.forEach(val => {
        let parent = document.getElementById(val);
        parent.removeChild(parent.children[0]);
    });
}
//--------------showTotal------------------
function showTotal(arr) {
    let nest = document.getElementById('total');
    let innerTotal = document.createElement('div');
    innerTotal.className = 'innerTotal';
    innerTotal.innerText = arr.length;
    nest.appendChild(innerTotal);
}
//------------buildList-------------------
function buildList(arr) {
    let namesArr = getNamesArr(arr);

    let table = `<table class = "list_table">`;
    namesArr.forEach(item => {
        table += `<tr><td>${item}</td></tr>`
    });
    table += `</table>`;

    let nest = document.getElementById('list');
    nest.style.overflow = 'auto';
    nest.innerHTML = table;
}
//------------bindClickOnList---------
function bindClickOnList() {
    let elem = document.getElementById('list');
    elem.onclick = function(e) {
        showPartners(e);
    };
}
//-------------------------------------------
function showPartners(e) {
    clearCheckedBg();
    currentComp = e.target.innerText;
    e.target.style.backgroundColor = '#ffff99';
    if (!initObj.partnersFlag) {
        showPartnersDiv();
        showHeaderPartn();
        fillPartnerDiv(initObj.defaultSortParam);
        initObj.partnersFlag = true;
    } else {
        fillPartnerDiv(initObj.defaultSortParam);
    }
}
//----------------------------------------
function fillPartnerDiv(sortParam) {
    let partners = findPartnArr(currentComp, dataCompArr);
    sortPartnArr(sortParam);
    buildView(partners);
}
//------------findPartnArr-------------
function findPartnArr(name, arr) {
    for (let val of arr) {
        if (val.name === name) {
            return val.partners;
        }
    }
}
//--------------clearCheckedBg--------------
function clearCheckedBg() {
    let elem = document.querySelectorAll('td');
    for (let item of elem) {
        item.style.backgroundColor = 'inherit';
    }
}
//--------------sort-------------------
function sortPctUp(arr) {
    arr.sort((a,b) => a.value-b.value)
}

function sortPctDown(arr) {
    arr.sort((a,b) => b.value - a.value)
}

function sortNameUp(arr) {
    arr.sort((a,b) => a.name > b.name)
}

function sortNameDown(arr) {
    arr.sort((a,b) => b.name > a.name)
}
//-----------buildView--------------------
function buildView(arr) {
    let widthPartnCont = window.innerWidth < 768 ? 125: 190;
    console.log(widthPartnCont);
    let widthScrollCont = arr.length * widthPartnCont;

    let nest = document.getElementById('partners');
    let scrollCont = document.createElement('div');
    scrollCont.className = 'scrollCont';
    scrollCont.style.width = `${widthScrollCont}px`;

    let templMain = '';
    arr.forEach((val) => {
        let pct = val.value;
        let templForPct ='';
        for (var i = 0; i < pct; i++) {
            templForPct += `<div class = 'pct'></div>`;
        }

        let templEachComp = `
			<div class = 'containerPartn'>
				<div class = 'nameOfPartn'>${val.name}</div>
				<div class = 'percentCont'>${templForPct}</div>
				<div class = 'percentOfPartn'>${val.value}</div>
			</div>`;
        templMain += templEachComp;
    });
    scrollCont.innerHTML = templMain;
    nest.appendChild(scrollCont);

    bindSortFunc();
}
//-------------showHeaderPartn------------
function showHeaderPartn() {

    let nest = document.getElementById('headerPartner') ;
    nest.innerText = 'Partners';
    let elem = document.createElement('div');
    elem.className = 'sortItem';

    let templ = `
		<div><b>sort by: </b></div>
		<div class = 'sortBy'>name</div>
		<div class = 'btn-group'>
				<button id = 'nameUp'>
					<i class="fas fa-sort-up fa-lg"></i>
				</button>
				<button id = 'nameDown'>
					<i class="fas fa-sort-down fa-lg"></i>
				</button>
		</div>
		<div class = 'sortBy'>%</div>
		<div class = 'btn-group'>
			<button id = 'pctUp'>
				<i class="fas fa-sort-up fa-lg"></i>
			</button>
			<button id = 'pctDown'>
				<i class="fas fa-sort-down fa-lg"></i>
			</button>
		</div>
	`;
    elem.innerHTML = templ;
    nest.appendChild(elem);
}
//------------bindSortFunc------------------
function bindSortFunc() {
    let elem1 = document.getElementById('pctUp');
    elem1.onclick = function() { fillPartnerDiv('pctUp') };

    let elem2 = document.getElementById('pctDown');
    elem2.onclick = function() { fillPartnerDiv('pctDown') };

    let elem3 = document.getElementById('nameUp');
    elem3.onclick = function() { fillPartnerDiv('nameUp') };

    let elem4 = document.getElementById('nameDown');
    elem4.onclick = function() { fillPartnerDiv('nameDown') };
}
//----------------sortPartnArr---------------
function sortPartnArr(param) {
    let partners = findPartnArr(currentComp, dataCompArr);
    initObj.defaultSortParam = param;
    if (param === 'pctUp') {
        sortPctUp(partners);
    } else if (param === 'pctDown') {
        sortPctDown(partners);
    } else if (param === 'nameUp') {
        sortNameUp(partners);
    } else if (param === 'nameDown') {
        sortNameDown(partners);
    }
    if (document.querySelector('.scrollCont')) {
        document.querySelector('.scrollCont').remove();
    }
}
//-----------getNamesArr------------------
function getNamesArr(arr) {
    let compsArr = [];
    arr.forEach(item => compsArr.push(item.name));
    return compsArr;
}
//-----------buildCountryLocObj---------
function buildCountryLocObj(arr) {
    let countryArr = [];
    arr.forEach(val => countryArr.push(val.location.code));

    let countryObj = {};
    countryArr.forEach(val => {
        if (countryObj[val] !== undefined) {
            countryObj[val]++;
        } else {
            countryObj[val] = 1;
        }
    });
    return countryObj;
}
//-----------buildGraph---------------
function buildGraph(obj) {
    let labels = Object.keys(obj);
    let data = [];
    for (let key in obj) {
        data.push(obj[key]);
    }

    let elem = document.createElement('canvas');
    elem.setAttribute('id', 'chart');
    elem.style.width = '90%';
    elem.style.height = '90%';

    let nest = document.getElementById('location');
    nest.appendChild(elem);

    let ctx = document.getElementById('chart').getContext('2d');
    let mychart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: labels,
            datasets: [{
                backgroundColor: ['#ff4d4d', '#4d94ff', '#ffff4d', '#4dff4d', '#d24dff', '#ff4da6'],
                data: data
            }]
        },
        options: {
            responsive: true,
            legend: {
                display: false
            }
        }
    });

    elem.onclick = function(e) {
        buildTableByLoc(e, mychart);
    }
}
//--------------------------------------------------
function buildTableByLoc(e, mychart) {
    if (mychart.getElementsAtEvent(e)[0]) {
        initObj.graphClickFlag = true;
        let country = mychart.getElementsAtEvent(e)[0]._model.label;
        let compInCountryArr = findCompInCountry(country);

        let table = `<table id = tableContrByLoc class = "list_table">`;
        compInCountryArr.forEach(item => {
            table += `<tr><td>${item}</td></tr>`
        });
        table += `</table>`;

        let nest = document.getElementById('location');
        nest.style.overflow = 'auto';
        nest.innerHTML = table;

        changeLocHeader(country, compInCountryArr);
    }
}
//-----------------findCompInCountry-----------------------
function findCompInCountry(country) {
    let compArr = [];
    dataCompArr.forEach(val => {
        if (val.location.code.indexOf(country) >= 0) {
            compArr.push(val.name);
        }
    });
    return compArr;
}
//-----------------changeLocHeader--------------------
function changeLocHeader(country, compArr) {
    let nest = document.getElementById('headerLoc');
    nest.innerText = `Companies in ${country}: ${compArr.length}`;
    let returnBtn = document.createElement('button');
    returnBtn.setAttribute('id', 'returnBtn');
    returnBtn.innerHTML = `<i class="fas fa-arrow-left fa-2x"></i>`;
    nest.appendChild(returnBtn);

    returnBtn.onclick = returnToGraph;
}
//------------------returnToGraph-----------------------
function returnToGraph() {
    document.getElementById('headerLoc').innerText = "Companies by Location";
    document.getElementById('tableContrByLoc').remove();
    let countryLocArr = buildCountryLocObj(dataCompArr);
    buildGraph(countryLocArr);
}
//---------------DataNewsHandling--------------------
function DataNewsHandling(data) {
    dataNewsArr = data.list;
    buildTemplForNews();
    showNews(dataNewsArr);
}
//---------------buildTemplForNews--------------------
function buildTemplForNews() {
   let nest = document.getElementById('news');
   let templForNews =
       `<div class = "nest">
          <div class = 'nest__contImg'>
            <img id = 'icon' class = 'nest__img' src="" alt = "ico" />
          </div>
          <div class="nest__contNews">
            <div id = 'header' class="nest__headerNews"></div>
            <div id = 'newsData' class="nest__textNews"></div>
          </div>
          <div class="nest__signatures">
            <div id = 'author' class="nest__author"></div>
            <div id = 'date' class="nest__date"></div>
          </div>
          <div id = 'arrows' class="nest__contArr">
            <button id = 'prev'><i class="fas fa-chevron-circle-left fa-3x"></i></button>
            <button id = 'next'><i class="fas fa-chevron-circle-right fa-3x"></i></button>
          </div>
         </div>`;
   nest.innerHTML = templForNews;
}
//-----------------showNews--------------------
function showNews(arr) {

    let img = arr[initObj.sliderCurrentFlag].img;
    document.getElementById('icon').setAttribute('src', img);

    let author = arr[initObj.sliderCurrentFlag].author;
    document.getElementById('author').innerText = author;

    let header = arr[initObj.sliderCurrentFlag].link;
    document.getElementById('header').innerHTML = `<a href = "https://${header}" target="_blank">${header}</a>`;

    let description = arr[initObj.sliderCurrentFlag].description;
    let news = description.length > 120? `${description.slice(0, 120)}...<em>[visit our webcite]</em>`: description;
    document.getElementById('newsData').innerHTML = news;

    let options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    };
    let date = new Date(arr[initObj.sliderCurrentFlag].date *1000).toLocaleString('ru-RU', options);
    document.getElementById('date').innerText = date;

    let next = document.getElementById('next');
    next.onclick = function(){showNext(1)};
    let prev = document.getElementById('prev');
    prev.onclick = function(){showNext(-1)};
}
//--------------showNext---------------
function showNext(n) {
    initObj.sliderCurrentFlag += n;

    if (initObj.sliderCurrentFlag > dataNewsArr.length - 1) {
        initObj.sliderCurrentFlag = 0;
    }
    else if (initObj.sliderCurrentFlag < 0) {
        initObj.sliderCurrentFlag = dataNewsArr.length - 1;
    }
    showNews(dataNewsArr);
}