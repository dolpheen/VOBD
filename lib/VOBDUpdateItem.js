/**
 * Created with JetBrains WebStorm.
 * User: vadim
 * Date: 02.10.13
 * Time: 20:37
 * To change this template use File | Settings | File Templates.
 */

/**
 *  UpdateItem is used to update object properties in time
 *  For example used to change uniforms of shaders to make transition effects (glowing, alpha, etc.)
 *
 *  Parameters:
 *  object and key - Object and object property supposed to be changed
 *  value - Value to be changed to
 *  speed - Speed (linear) of transition (0 .. 1)
 */
VOBD.UpdateItem = function(parameters){

    this.object = parameters.object;
    this.key = parameters.key;
    this.value = parameters.value;
    this.speed = parameters.speed !== undefined ? parameters.speed : 0.1 ;

    // true if item finishes its transition
    this.done = false;

    // Holds current value during transition
    this._currValue = 0;

    // Increment/decrement value during transition
    this._step = 0;

    //Initialize variables
    this.init();

};

/**
 * Initialize some item variables
 */
VOBD.UpdateItem.prototype.init = function(){
    this._currValue = this.object[this.key];
    this._step = ( this.value - this._currValue ) / 1000 * this.speed * 100;
    this.done = false;
}

/**
 *  Updates object value
 *
 * @param delta - delta time in milliseconds from the previous call
 *                used for transition amount calculation
 * @returns {*}
 */
VOBD.UpdateItem.prototype.update = function(delta){

    //Safety check weather the current item is finished
    if(! this.done){

        // calc difference between the current value and end value
        var dif = Math.abs(this.object[this.key] - this.value);

        // check if difference lower then increment amount
        if( dif > Math.abs(this._step * delta)){
            this._currValue += (this._step * delta);

            // Check if the calculated value is not lower/bigger our end value
            if(this.step * (this.value - this._currValue ) < 0)  this._currValue = this.value;

            this.object[this.key] = this._currValue;
        }else{
            this.done = true;
            this.object[this.key] = this.value;
        }
    }

    return this;
};

/**
 * UpdateItems - holds and manipulates items to be updated
 *  *
 * @constructor
 */
VOBD.UpdateItems = function(){

    this.items = [];
};

/**
 *  Add Item to be updated
 *
 * @param updateItem
 * @returns {*}
 */
VOBD.UpdateItems.prototype.add = function(updateItem){

    //We should check and repalce the updateUitem if it already exist in the array
    for( var i = 0; i < this.items.length; i++){
        var item = this.items[i];
        if(item.object === updateItem.object && item.key === updateItem.key){
            item.value = updateItem.value;
            item.speed = updateItem.speed;
            item.init();
            break;
        }
    }

    if(i >= this.items.length) this.items.push(updateItem);

    return this;
};

/**
 * Call update function of item and check wether it is done and delete from the array
 * @param delta
 */
VOBD.UpdateItems.prototype.update = function( delta ){

    for(var i = 0;  i  < this.items.length; i++)
        if(this.items[i].update(delta).done) this.items.splice( i--, 1);

};
