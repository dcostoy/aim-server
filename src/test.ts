import { parseTLVs }  from './parseTLVs'
import { Snac } from './types'
import { SNACS } from './constants'
import { MultiMap } from './MultiMap'
import {prettyPrintSnac, parseSnac } from './snacUtils'

interface TLV {
    type: number;
    length: number;
    value: Buffer;
}

const data = Buffer.from([0x00, 0x04, 0x00, 0x07, 0x00, 0x00, 0x90, 0x2F, 0x30, 0x11, 0x70, 0x95, 0xA0, 0x00, 0x26, 0x1F, 0x00, 0x00, 0x00, 0x02, 0x07, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01, 0x00, 0x02, 0x00, 0x50, 0x00, 0x06, 0x00, 0x04, 0x20, 0x12, 0x00, 0x00, 0x00, 0x0F, 0x00, 0x04, 0x00, 0x00, 0x06, 0xF3, 0x00, 0x03, 0x00, 0x04, 0x40, 0x5A, 0x93, 0x78, 0x00, 0x05, 0x01, 0x5B, 0x00, 0x00, 0x70, 0x95, 0xA0, 0x00, 0x26, 0x1F, 0x00, 0x00, 0x09, 0x46, 0x13, 0x49, 0x4C, 0x7F, 0x11, 0xD1, 0x82, 0x22, 0x44, 0x45, 0x53, 0x54, 0x00, 0x00, 0x00, 0x0A, 0x00, 0x02, 0x00, 0x01, 0x00, 0x0F, 0x00, 0x00, 0x27, 0x11, 0x01, 0x33, 0x1B, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0xE3, 0xFF, 0x0E, 0x00, 0xE3, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x21, 0x00, 0xCC, 0x00, 0x7B, 0x5C, 0x72, 0x74, 0x66, 0x31, 0x5C, 0x61, 0x6E, 0x73, 0x69, 0x5C, 0x61, 0x6E, 0x73, 0x69, 0x63, 0x70, 0x67, 0x31, 0x32, 0x35, 0x31, 0x5C, 0x64, 0x65, 0x66, 0x66, 0x30, 0x5C, 0x64, 0x65, 0x66, 0x6C, 0x61, 0x6E, 0x67, 0x31, 0x30, 0x34, 0x39, 0x7B, 0x5C, 0x66, 0x6F, 0x6E, 0x74, 0x74, 0x62, 0x6C, 0x7B, 0x5C, 0x66, 0x30, 0x5C, 0x66, 0x6E, 0x69, 0x6C, 0x5C, 0x66, 0x63, 0x68, 0x61, 0x72, 0x73, 0x65, 0x74, 0x32, 0x30, 0x34, 0x7B, 0x5C, 0x2A, 0x5C, 0x66, 0x6E, 0x61, 0x6D, 0x65, 0x20, 0x4D, 0x53, 0x20, 0x53, 0x61, 0x6E, 0x73, 0x20, 0x53, 0x65, 0x72, 0x69, 0x66, 0x3B, 0x7D, 0x4D, 0x53, 0x20, 0x53, 0x68, 0x65, 0x6C, 0x6C, 0x20, 0x44, 0x6C, 0x67, 0x3B, 0x7D, 0x7D, 0x0D, 0x0A, 0x7B, 0x5C, 0x63, 0x6F, 0x6C, 0x6F, 0x72, 0x74, 0x62, 0x6C, 0x20, 0x3B, 0x5C, 0x72, 0x65, 0x64, 0x30, 0x5C, 0x67, 0x72, 0x65, 0x65, 0x6E, 0x30, 0x5C, 0x62, 0x6C, 0x75, 0x65, 0x30, 0x3B, 0x7D, 0x0D, 0x0A, 0x5C, 0x76, 0x69, 0x65, 0x77, 0x6B, 0x69, 0x6E, 0x64, 0x34, 0x5C, 0x75, 0x63, 0x31, 0x5C, 0x70, 0x61, 0x72, 0x64, 0x5C, 0x63, 0x66, 0x31, 0x5C, 0x66, 0x30, 0x5C, 0x66, 0x73, 0x32, 0x30, 0x3C, 0x23, 0x23, 0x69, 0x63, 0x71, 0x69, 0x6D, 0x61, 0x67, 0x65, 0x30, 0x30, 0x30, 0x38, 0x3E, 0x5C, 0x70, 0x61, 0x72, 0x0D, 0x0A, 0x7D, 0x0D, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0x26, 0x00, 0x00, 0x00, 0x7B, 0x39, 0x37, 0x42, 0x31, 0x32, 0x37, 0x35, 0x31, 0x2D, 0x32, 0x34, 0x33, 0x43, 0x2D, 0x34, 0x33, 0x33, 0x34, 0x2D, 0x41, 0x44, 0x32, 0x32, 0x2D, 0x44, 0x36, 0x41, 0x42, 0x46, 0x37, 0x33, 0x46, 0x31, 0x34, 0x39, 0x32, 0x7D]);

var snacData = parseSnac(data);
var snacFamily = data.subarray(0,2);
var snacSubtype = data.subarray(2,4);
var snacFlags = data.subarray(4,6);
var snacRequestId = data.subarray(6,10);
var msgIdCookie = data.subarray(10,18);
var msgChannel = data.subarray(18,20);
var screenNameLen = parseInt(data.subarray(20,21).toString("hex"));
var cursor = 21+screenNameLen;
var screenName = data.subarray(21,cursor).toString();
var senderWarningLevel = data.subarray(cursor,cursor+2)
cursor += 2;
var fixedTLVcount = parseInt(data.subarray(cursor,cursor+2).toString("hex"));
cursor += 2;
var tlvs = new MultiMap<number, TLV>();
tlvs = parseTLVs(data.subarray(cursor))

console.log("SNAC Family: ");
console.log(snacData.family.toString(16).padStart(2, '0'))
//console.log(snacFamily);
console.log("SNAC Subtype: ");
console.log(snacSubtype);
console.log("SNAC Flags: ");
console.log(snacFlags);
console.log("SNAC Request ID: ");
console.log(snacRequestId);
console.log("-----");
console.log("Message ID Cookie: ");
console.log(msgIdCookie);
console.log("Message Channel: ")
console.log(msgChannel);
console.log("Screen Name Length: ");
console.log(screenNameLen);
console.log("Screen Name: ");
console.log(screenName);
console.log("Sender Warning Level: ");
console.log(senderWarningLevel);
console.log("Number of Fixed TLVs: ");
console.log(fixedTLVcount);
console.log("TLVs: ");
console.log(tlvs);
console.log(prettyPrintSnac(snacData));