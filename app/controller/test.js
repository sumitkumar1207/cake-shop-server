let sql = require('@/app/db/database')
const async = require('async');

module.exports.Test = (req, res) => {
  //Input array
  let inputArr = [8, 4, 5, 3, 1, 2, 7, 11]
  //Function that will sort the array in ascending
  const sortArray = (array) => {
    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j <= i; j++) {
        if (array[i] < array[j]) {
          //Call the helper function to swap the numbers
          swap(array, i, j)
        }
      }
    }
    return array
  }

  //Function that will swap the array elements
  const swap = (array, index1, index2) => {
    let temp = array[index1];
    array[index1] = array[index2];
    array[index2] = temp
  }

  //  console.log('sortArray(inputArr)', sortArray(inputArr))
  //Get the sorted array result in a variable
  let sortedArray = sortArray(inputArr);
  let missing = [];

  //Function that will find the missing number in an array
  const missingNumberInArray = (arr) => {
    let l = Math.max(...arr);
    console.log('l', l)
    for (let i = 1; i < l; i++) {
      if (arr.indexOf(i) < 0) {
        console.log('i', i)
        missing.push(i);
      }
    }
    return missing;

    // for (var i = 0; i < arr.length; i++) {
    //   if ((arr[i + 1] - arr[i]) > 1) {
    //     missing.push(arr[i + 1] - arr[0]);
    //   }
    // }
    return missing;
  }

  console.log('missingNumberInArray()', missingNumberInArray(sortedArray));

  /*
    //Declear empty array to push unique character
    let uniqueChar = []
    //Make a function that will loop in the raw array
    const findUniqueChar = (char) => {
      //make sure that all letters should be in small letter
      char = char.toLowerCase();
      //Make an array of characters
      let rawArr = char.split(' ').join('').split('')
      //Loop through the raw array and call the helper function
      rawArr.map((ch, index) => {
        let cc = charCounting(rawArr, ch)
        if (cc === 1) {
          uniqueChar.push(ch)
        }
      })
      return uniqueChar
    }
    //A helper function that will count the letter occurance in the array
    const charCounting = (arr, charecter) => arr.filter(item => item == charecter).length;
  
    console.log('findUniqueChar("Hey this is test") :>> ', findUniqueChar("Hey this is test"));
  */

  return res.status(200).json({ status: true, message: "Successfull, test route working", error: null, Records: [] });

}
