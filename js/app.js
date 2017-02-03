'use strict';
// global constant
var _EMOTIONS = ["positive", "negative", "anger", "anticipation", "disgust", "fear", "joy", "sadness", "surprise", "trust"];

// takes in word and returns true if its more than one letter
function wordLength(word) {
        return word.length >= 2;
}

// takes in a tweet and extracts the words, returns an array of words
function extractWords(tweet){
    var tweet = tweet.toLowerCase();
    var arr = tweet.split(/\W+/);
    arr = arr.filter(wordLength);
    return arr;
}

// takes in array of words from above and returns an object with sentiments as keys with word array values
function findSentimentWords(arr) {
    var sentiment = {}
    for (var i = 0; i < _EMOTIONS.length; i++) {
        sentiment[_EMOTIONS[i]] = [];
    }
    for(var i = 0; i < arr.length; i++) {
        if (_SENTIMENTS[arr[i]] !== undefined){
            var emotions = Object.keys(_SENTIMENTS[arr[i]]);
            for(var j = 0; j < emotions.length; j++) {
                sentiment[emotions[j]].push(arr[i]);
            }
        }    
    }
    return(sentiment);
}

// takes in arrray in tweet data, returns object with sentiment frequences, popular words and popular hashtags
function analyzeTweets(sampleTweet) {
    var arr = sampleTweet;
    arr.forEach(function (tweet) {
        tweet["keySentiments"] = findSentimentWords(extractWords(tweet.text));
        tweet.words = extractWords(tweet.text);
        tweet.sentiments = findSentimentWords(tweet.words);
    });
    var wordCount = arr.reduce(function (total, tweet) {
        var num = tweet.words.length;
        return total + num;
    }, 0);
    var frequences = {};
    _EMOTIONS.forEach(function (emotion) {
        var sentimentCount = arr.reduce(function (total, tweet) {
            var num = tweet.sentiments[emotion].length;
            return total + num;
        }, 0);
        var percent = sentimentCount / wordCount;
        percent = percent * 100;
        percent = Math.round(percent * 100);
        frequences[emotion] = percent;
    });
    var commonWords = {};
    _EMOTIONS.forEach(function (emotion) {
        var words = {};
        arr.forEach(function (tweet) {
            var wordArray = tweet.sentiments[emotion];
            wordArray.forEach(function (word) {
                if (words[word]) {
                    words[word]++;
                } else {
                    words[word] = 1;
                }
            });
        });
        var keys = Object.keys(words);
        keys = keys.sort(function (a, b) {
            return words[b] - words[a];
        });
        keys.forEach(function (words) {
            keys = [keys[0], keys[1], keys[2]];
        });
        commonWords[emotion] = keys;
    });
    var sampleTweet = {};
    _EMOTIONS.forEach(function (emotion) {
        sampleTweet[emotion] = {};
        sampleTweet[emotion]["sentimentFrequency"] = frequences[emotion];
        sampleTweet[emotion]["PopularWords"] = commonWords[emotion];
        sampleTweet[emotion]["hashTags"] = getHashtags(_SAMPLE_TWEETS, emotion);
        sampleTweet[emotion]["PopularHashTags"] = topHashTags(sampleTweet[emotion]["hashTags"]);
    });
    return sampleTweet;
}

// gets all the hashtags takes in sample tweets and emotion array 
function getHashtags(tweetData, emotions) {
    var tweets = tweetData.filter(function (tweet) {
        return (tweet['keySentiments'][emotions].length > 0);
    });
    var everyHashTag = tweets.map(function (tweet) {
        return tweet['entities']['hashtags'].map(function (hashtag) {
            return '#' + hashtag['text'];
        });
    });
    everyHashTag = flattenArray(everyHashTag);
    everyHashTag = everyHashTag.filter(function (hashtag) {
        return (hashtag.length > 1);
    });
    return everyHashTag;
}

// helper method to flatten array - concatinate it
function flattenArray(hashTagArrays) {
    return hashTagArrays.reduce(function (a, b) {
        return a.concat(b);
    });
}

// takes in hashtags found returned from getHashtags and returns the most popular ones
function topHashTags(array) {
    var hashTagList = [];
    array.forEach(function (word) {
        if (hashTagList[word]) {
            hashTagList[word]++;
        } else {
            hashTagList[word] = 1;
        }
    });
    var keys = Object.keys(hashTagList);
    keys = keys.sort(function (a, b) {
        return hashTagList[b] - hashTagList[a];
    });
    keys = keys.slice(0, 3); 
    return keys;
}

// displays data in table
function showStatistics(tweetData) {
    var emotions = Object.keys(_EMOTIONS);
    emotions.forEach(function (emotion) {
        var sent = document.createElement("tr");
        sent.textContent = emotion;
        var percent = document.createElement("td");
        percent.textContent = tweetData[emotion].percentage + "%";
        sent.appendChild(percent);
        var words = document.createElement("td");
        var str = tweetData[emotion].topWords.join(', ');
        words.textContent = str;
        sent.appendChild(words);
        var tags = document.createElement("td");
        var tagData = tweetData[emotion].topTags.join(', #');
        tags.textContent = "#" + tagData;
        sent.appendChild(tags);
        var table = document.querySelector("tbody");
        table.appendChild(sent);
    });
}

// attempt to start load data part of assignment
function loadTweets(url) {
   fetch(url).then(function (response) {
       analyzeTweets();
    }).then(function (response) {
       showStatistics();
    }).catch(function(error) {  
   console.log('Request failed', error);  
 });
}

