const http = require("https");
const JSDOM = require("jsdom").JSDOM;
const url = require("url");

const topics = ["artificial-intelligence","data-science","javascript","programming","software-engineering"];

function downloadPage(urlToDownload,callback){
    const request = http.get(urlToDownload,(response) => {
    if(response.statusCode != 200){
        console.error(`Error while downloading page ${urlToDownload}`);
        console.error(`Response was ${response.statusCode} ${response.statusMessage}`);
        return;
    }
    let content = "";
    response.on("data",(chunk) => {
        content+=chunk.toString();
    });
    response.on("close",() => {
        callback(content);
    })
    });
    request.end();
}

topics.forEach(topic => {
    downloadPage(`https://medium.com/topic/${topic}`,(content) => {
        const articles = findArticles(new JSDOM(content).window.document);
        Object.values(articles).forEach(printArticle);
    })
})

//go through the DOM parsed from page and returns an object, of which the keys are the article title and values are objects containing info about each article
function findArticles(document){
    const articles = {};
    //medium article path have 2 parts /author/articleId
    //using chrome dev tools its seen that title of article is inside of a header element whose next sibling is a DIV that contains short description
    Array.from(document.querySelectorAll("h1 a","h3 a"))
    .filter(el => {
        const parsedUrl = url.parse(el.href);
        const split = parsedUrl.pathname.split("/").filter((s) => s.trim() != "");
        return split.length == 2;
    })
    .forEach(el => {
        const description = el.parentNode.nextSibling.querySelector("p a,h3 a").text;
        articles[el.text] = {
            description: description,
            link: url.parse(el.href).pathname,
            title: el.text,
        }
    })
    return articles;
}

function printArticle(article){
    console.log(`-----`);
    console.log(`${article.title}`);
    console.log(`${article.description}`);
    console.log(`https://medium.com${article.link}`)
}