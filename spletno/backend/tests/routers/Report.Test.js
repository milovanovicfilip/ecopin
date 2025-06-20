import request from 'supertest';
import index from "../index.js"
import mongoose from 'mongoose';
import Report from "../models/Report.Model.js"
import dotenv from "dotenv";
dotenv.config()

describe('Automatic testing of API routes for Report', () => {
    let testReportId;
    let authToken;

    afterAll(async () => {
        await Report.deleteMany({});
        await mongoose.disconnect();
    });

    describe('POST rute', () => {
        test('POST /api/report', async () => {
            const newReport = {
                location: { 
                    type: 'Point', 
                    coordinates: [46.56145033140468, 15.635163957985426]
                },
                title: "Missing bin"
            };

            const response = await request(app)
                .post('/api/report')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newReport);

            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
        });

        test('POST /api/reports (invalid)', async () => {
            const invalidReport = {
                location: { 
                    type: 'Point', 
                    coordinates: [46.56145033140468, 15.635163957985426] 
                },
                reportType: 'invalid_type',
                city: 'Maribor'
            };

            const response = await request(app)
                .post('/api/reports')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidReport);

            expect(response.statusCode).toBe(400);
        });
    });


    describe('GET rute', () => {
        test('GET /api/reports', async () => {
            const response = await request(app)
            .get(`/api/reports`)
            .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
        });

        test('GET /api/reports/:id', async () => {
            const id = "1";

            const response = await request(app)
            .get(`/api/reports/${id}`)
            .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.statusCode).toBe(200);
            expect(response.body._id).toBe(testReport._id.toString());
        });
    });

    describe('PUT rute', () => {
        beforeEach(async () => {
            const testReport = await Report.create({
                location: { 
                    type: 'Point', 
                    coordinates: [20, 45] 
                },
                reportType: 'missing_bin',
                city: 'Maribor',
                status: 'pending'
            });
            testReportId = testReport._id;
        });

        test('PUT /api/reports/:id', async () => {
            const updates = {
                status: 'in_progress',
                description: 'Added description'
            };

            const response = await request(app)
            .put(`/api/reports/${testReportId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updates);

            expect(response.statusCode).toBe(200);
            expect(response.body.status).toBe('in_progress');
        });
    });

    describe('DELETE rute', () => {
        beforeEach(async () => {
            const testReport = await Report.create({
                location: { 
                    type: 'Point', 
                    coordinates: [20, 45] 
                },
                reportType: 'missing_bin',
                city: 'Maribor'
            });
            testReportId = testReport._id;
        });

        test('DELETE /api/reports/:id', async () => {
            const response = await request(app)
            .delete(`/api/reports/${testReportId}`)
            .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
        
            const deletedReport = await Report.findById(testReportId);
            expect(deletedReport).toBeNull();
        });
    });

  describe('Authentification and authorization', () => {
    test('Reject unauthorized requests', async () => {
         const response = await request(app)
        .get('/api/reports')

        expect(response.statusCode).toBe(401);
    });

    test('Reject requests with invalid token', async () => {
        const response = await request(app)
        .get('/api/reports')
        .set('Authorization', 'Bearer invalidtoken123')

        expect(response.statusCode).toBe(403);
    });
  });
});