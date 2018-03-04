// ==UserScript==
// @name         LuxMed Auto Booker
// @namespace    http://ingwar.eu.org/
// @version      1.1
// @description  LuxMed Auto Booker
// @author       Karol Lassak <Ingwar Swenson>, Piotr Dutko <p.dutko@webdudi.pl>
// @match        https://portalpacjenta.luxmed.pl/PatientPortal/Reservations/Reservation/Find
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==


function checkVisits() {
    var foundDivs = document.getElementsByClassName("reserveButtonDiv");
    console.log("Found " + (foundDivs.length ? foundDivs.length : 0) + " visits..");

    if (foundDivs.length) {
        console.log("Filtering..");

        foundDivs = jQuery.map(foundDivs, filterNeeded);
    }

    console.log("Found " + (foundDivs.length ? foundDivs.length : 0) + " visits.. after filtering..");

    if (!autoEnabled()) {
        console.log("Auto search is disabled.. NOT accepting visit..");
        return;
    }

    if (foundDivs.length && autoBook()) {
        var found = foundDivs[0];

        found.click();
        setTimeout(acceptVisit, 5000);
    } else {
        console.log("NOT Found any visits, researching..");
        setTimeout(function () {
            $('#reservationSearchSubmitButton').click();
        }, GM_getValue("time_reload", 5000));
    }
}

function filterNeeded(div) {
    var a = jQuery(div).find('a');
    var hour = parseInt(a[0].outerText.substring(0, 2));
    console.log("Hour: " + hour);

    if (hour > GM_getValue("time_to")) {
        console.log("Hour: " + hour + " > " + GM_getValue("time_to") + " REMOVING from list");
        return null;
    }
    if (hour < GM_getValue("time_from")) {
        console.log("Hour: " + hour + " < " + GM_getValue("time_from") + " REMOVING from list");
        return null;
    }

    return a;
}

function acceptVisit() {
    var accept = document.getElementById("okButton");
    if (isHidden(accept)) {
        console.log("Element is hidden .. NOT Accepting visit..");
        return;
    }
    accept.click();
    document.getElementById("okButton").click();

}

function autoBook() {
    return GM_getValue("auto_book");

}

function switchAutoBook() {
    if (autoBook()) {
        console.log("Turning off auto book");
        GM_setValue("auto_book", 0);
    } else {
        console.log("Turning on auto book");
        GM_setValue("auto_book", 1);
    }
}

function addAutoSearch() {
    console.log("Adding auto search checkbox..");
    var filtersDiv = document.getElementById("filtersDiv");

    var div = document.createElement("div");
    div.style.background = "#eeeeee";
    div.style.padding = "10px";

    var header = document.createElement('h3');
    header.innerHTML = 'LuxMed Auto Booker';
    header.style.marginBottom = '10px';
    div.appendChild(header);

    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = autoEnabled();
    input.onclick = switchAuto;


    var from = document.createElement("input");
    from.id = "time_from";
    from.max = 24;
    from.min = 0;
    from.type = "number";
    from.value = GM_getValue("time_from");
    from.onchange = setTimeFrom;

    var to = document.createElement("input");
    to.id = "time_to";
    to.max = 24;
    to.min = 0;
    to.type = "number";
    to.value = GM_getValue("time_to");
    to.onchange = setTimeTo;

    var timeReload = document.createElement("input");
    timeReload.id = "time_reload";
    timeReload.max = 60;
    timeReload.min = 0;
    timeReload.type = "number";
    timeReload.value = GM_getValue("time_reload") / 1000;
    timeReload.onchange = setTimeReload;

    var inputAutoBook = document.createElement("input");
    inputAutoBook.type = "checkbox";
    inputAutoBook.checked = autoBook();
    inputAutoBook.onclick = switchAutoBook;


    addDivInput(div, 'Auto search', input);
    addDivInput(div, 'Auto book', inputAutoBook);
    addDivInput(div, 'Godzina od', from);
    addDivInput(div, 'Godzina do', to);
    addDivInput(div, 'Czas przeładowania [s]', timeReload);


    filtersDiv.appendChild(div);
}

function addDivInput(el, labelName, input) {

    var label = document.createElement('label');
    label.innerHTML = labelName;
    el.appendChild(label);

    label.appendChild(input);

    var div = document.createElement("div");
    div.style.marginBottom = '5px';
    div.appendChild(label);
    el.appendChild(div);
}

function addTextNode(el, str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    el.appendChild(div);
}

function setTimeFrom() {
    var val = this.value;
    console.log("Setting FROM to: " + val);
    GM_setValue("time_from", val);
}

function setTimeTo() {
    var val = this.value;
    console.log("Setting TO to: " + val);
    GM_setValue("time_to", val);
}

function setTimeReload() {
    var val = this.value;
    console.log("Setting time_reload to: " + val);
    GM_setValue("time_reload", val * 1000);
}

function autoEnabled() {
    return GM_getValue("auto");
}

function switchAuto() {
    if (autoEnabled()) {
        console.log("Turning off auto");
        GM_setValue("auto", 0);
    } else {
        console.log("Turning on auto");
        GM_setValue("auto", 1);
    }
}

function isHidden(el) {
    return (el.offsetParent === null);
}

$(document).ready(function () {
    addAutoSearch();
    checkVisits();
});
