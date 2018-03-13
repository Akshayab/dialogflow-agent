'use strict';
process.env.DEBUG = 'actions-on-google:*';

const Assistant = require('actions-on-google').ApiAiAssistant;
const request_module = require('request');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stateMachine = require('./state_machine').stateMachine;
admin.initializeApp(functions.config().firebase);

const COFFEE_INTENT = 'coffee_intent';
const DARK_COFFEE_INTENT = 'dark_coffee';
const LIGHT_COFFEE_INTENT = 'light_coffee';
const COFFEE_PREFERENCE_INTENT = 'coffee_preference_action'
const FALL_BACK_INTENT = 'fall_back_intent';
const INPUT_UNKNOWN_INTENT = 'input.unknown';
const NEXT_INTENT = 'next_intent';

const TEA_INTET = 'tea_intent';
const REPEAT_INTENT = 'repeat_intent';
const REPEAT_DUPLICATE = 'repeat';
const HELP_INTENT = 'help';
const EXIT_INTENT = 'exit_intent';

exports.assistantcodelab = functions.https.onRequest((request, response) => {

    const assistant = new Assistant({request: request, response: response});

    let actionMap = new Map();
    actionMap.set(COFFEE_INTENT, start_coffee_intent);
    actionMap.set(COFFEE_PREFERENCE_INTENT, coffee_preference_intent_handler);
    actionMap.set(NEXT_INTENT, next_intent_handler);
    actionMap.set(FALL_BACK_INTENT, fall_back_intent_handler);
    actionMap.set(INPUT_UNKNOWN_INTENT, fall_back_intent_handler);
    actionMap.set(REPEAT_INTENT, repeat_intent_handler);
    actionMap.set(REPEAT_DUPLICATE, repeat_intent_handler);
    actionMap.set(HELP_INTENT, fall_back_intent_handler);
    actionMap.set(EXIT_INTENT, exit_intent_handler);
    actionMap.set(TEA_INTET, start_tea_intent);
    assistant.handleRequest(actionMap);


    function start_tea_intent(assistant) {

        stateMachine.reset_state();
        console.log('Starting tea intent');
        const response = stateMachine.get_current_response();
        stateMachine.update_current_step();
        assistant.ask(response);
    }

    function exit_intent_handler(assistant) {
        assistant.tell("Thank you for using Dr. Alice, bye!");
    }

    function start_coffee_intent(assistant) {

        stateMachine.reset_state();
        console.log('start_coffee_intent');
        const speech = `<speak>
        Great! To make dark coffee roast dark coffee beans
        </speak>`;
        assistant.ask(speech)
    }

    function coffee_preference_intent_handler(assistant) {
        const coffee_type = assistant.getArgument('coffee_parameter');
        switch(coffee_type) {
            case 'dark_coffee':
                assistant.ask('Great, time to make dark coffee. First please dark roast your coffee beans');

            case 'light_coffee':
                assistant.ask('Really, light coffee is for losers!')
        }
        console.log('--------------------------------------')
    }

    function repeat_intent_handler(assistant) {
        let response = stateMachine.get_previous_response();
 
        response = "Hi, looks like you are having some trouble, let me repeat the step for you. " + response;
        stateMachine.update_current_step();
        assistant.ask(response);
    }

    function fall_back_intent_handler(assistant) {

        stateMachine.current_step -= 2;
        const prefixString = 'Hi, looks like you are having some trouble, I will repeat the previous step for you again.'
        const response = stateMachine.get_current_response();
        stateMachine.update_current_step()
        assistant.ask(prefixString + response);

    }

    function next_intent_handler(assistant) {
        console.log('NEXT_INTENT');
        let response = stateMachine.get_current_response();

        console.log("CURRENT RESPONSE");
        console.log(response);

        console.log('THE current step is ---------------------------------------')
        console.log(stateMachine.current_step);
        console.log('------------------------------------------------')
        if (stateMachine.is_final_step()) {
            assistant.tell(response);
        } else if(stateMachine.current_step===5) {

            try {
                const news_url = 'https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=44c02180f9d74292807a478638eeb22b';    
                console.log(news_url);
                request_module.get(news_url, (err, resp, body) => {
                    console.log(body);
                    const news_data = JSON.parse(body);
                    const title = news_data['articles'][0]['title'];
                    const description = news_data['articles'][0]['description'];
                    console.log('description: ', description);
    
                    response += ". While you are waiting, here is a quick trending news update." + title + "." + description +" I am going to set a timer for 5 minutes and I will get back to you." + '<break time="7s"/>' + ' Ok, times up!</speak>';
    
                    response = '<speak>' + response

                    console.log(response);

                    assistant.ask(response);
                })

            } catch (e) {
                console.log('err:', e);
            }
            
        } else {
            assistant.ask(response)
            assistant.ask('hello world');
        }

        stateMachine.update_current_step();
    }
 
});