//@ts-check

class StateMachine {

    
    constructor() {
        this.all_steps = {
            responses: [
                'Go to the kitchen and let me know when you are there',
                'Find your tea kettle',
                'Turn the faucet on and fill in some water',
                'Turn the faucet off',
                'Place the tea kettle on the stove, and turn it on to boil the water',
                'Find your tea cup, and put a teabag into the cup, while the water boils. Please wait for around 5 minutes',
                'Turn off your stove and pour the hot water into the cup',
                'Now wait for two to three minutes and put the tea bag in garbage. Your tea is ready. Enjoy!'
            ]
        }
        this.current_step = 0
        this.current_intent = '';
    
    }

    get_next_response(step) {
        this.current_step += 1;
        return this.get_current_response();
    }

    get_previous_response() {
        this.current_step -= 1;
        return this.get_current_response();
    }

    get_current_response() {
        if (this.current_step < 0) this.current_step = 0;
        console.log('the index is:', this.current_step);
        console.log('current response is:')
        this.all_steps.responses[this.current_step]
        return this.all_steps.responses[this.current_step];
    }

    update_current_step(stepNumber) {
        this.current_step += 1;
    }

    reset_state() {
        this.current_step = 0;
    }

    get_step() {
        return this.current_step;
    }

    is_final_step() {
        return this.current_step == this.all_steps.responses.length -1 ? true : false
    }
}

module.exports = {
    stateMachine: new StateMachine()
}
