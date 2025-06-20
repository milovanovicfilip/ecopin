import request from 'supertest';
import app from "../../index.js"
import mongoose from 'mongoose';
import Poi from "../../models/Poi.Model.js"
import dotenv from "dotenv";
dotenv.config()

describe('Automatic testing of API routes for Poi', () => {

    describe('POST rute', () => {
        test('POST /api/poi', async () => {
            const newPoi = {
                location: { 
                    type: 'Point', 
                    coordinates: [46.56145033140468, 15.635163957985426]
                },
                type: 'bin'
            };

            const response = await request(app)
                .post('/api/poi')
                .send(newPoi);

            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
        });

        test('POST /api/poi (invalid)', async () => {
            const invalidPoi = {
                location: { 
                    type: 'Point', 
                    coordinates: [46.56145033140468, 15.635163957985426] 
                },
                type: 'invalid-type'
            };

            const response = await request(app)
                .post('/api/poi')
                .send(invalidPoi);

            expect(response.statusCode).toBe(400);
        });
    });


    describe('GET rute', () => {
        test('GET /api/poi', async () => {
            const response = await request(app)
            .get(`/api/poi`)

            expect(response.statusCode).toBe(200);
        });
    });

});