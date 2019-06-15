let users = [{
    name: 'KING',
    score: 23
}, {
    name: 'ADMIN2',
    score: 42
},{
    name: 'Killer123',
    score: 78
},{
    name: 'GOD',
    score: 111
},{
    name: 'Ankit',
    score: 1
}, {
    name: 'Quizzzer',
    score: 5
}, {
    name: 'Rockstar',
    score: 10
}, {
    name: 'RedX',
    score: 79
}, {
    name: 'Luffy',
    score: 43
}, {
    name: 'MASTER',
    score: 96
}]


const compare = (a, b) => {
    if(a.score < b.score){
        return 1
    }
    if(a.score > b.score){
        return -1
    }
    return 0;
}

module.exports = {
    users,
    compare
}